package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/fastenhealth/fasten-onprem/backend/pkg"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/database"
	"github.com/fastenhealth/fasten-onprem/backend/pkg/models"
	"github.com/fastenhealth/fasten-sources/clients/factory"
	sourceModels "github.com/fastenhealth/fasten-sources/clients/models"
	sourcePkg "github.com/fastenhealth/fasten-sources/pkg"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"net/http"
	"strconv"
	"time"
)

// This function is used to sync resources from a source (via a callback function). The BackgroundJobSyncResourcesWrapper contains the logic for registering the background job tracking the sync.
func BackgroundJobSyncResources(
	parentContext context.Context,
	logger *logrus.Entry,
	databaseRepo database.DatabaseRepository,
	sourceCred *models.SourceCredential,
) (sourceModels.UpsertSummary, error) {
	return BackgroundJobSyncResourcesWrapper(
		parentContext,
		logger,
		databaseRepo,
		sourceCred,
		func(
			_backgroundJobContext context.Context,
			_logger *logrus.Entry,
			_databaseRepo database.DatabaseRepository,
			_sourceCred *models.SourceCredential,
		) (sourceModels.SourceClient, sourceModels.UpsertSummary, error) {
			// after creating the client, we should do a bulk import
			sourceClient, err := factory.GetSourceClient(sourcePkg.GetFastenLighthouseEnv(), _backgroundJobContext, _logger, _sourceCred)
			if err != nil {
				resultErr := fmt.Errorf("an error occurred while initializing hub client using source credential: %w", err)
				_logger.Errorln(resultErr)
				return nil, sourceModels.UpsertSummary{}, resultErr
			}

			summary, err := sourceClient.SyncAll(_databaseRepo)
			if err != nil {
				resultErr := fmt.Errorf("an error occurred while bulk importing resources from source: %w", err)
				_logger.Errorln(resultErr)
				return sourceClient, summary, resultErr
			}
			return sourceClient, summary, nil
		})
}

// BackgroundJobSyncResourcesWrapper is a background job that syncs all FHIR resource for a given source
// It is a blocking function that will return only when the sync is complete or has failed
// It will create a background job and associate it with the source
// It will also update the access token and refresh token if they have been updated
// It will return the sync summary and error if any
//
// It's a wrapper function that takes a callback function as an argument.
// The callback function is the actual sync operation that will be run in the background (regular source or manual source)
//
// TODO: run in background thread, or use https://gobyexample.com/tickers
// TODO: use goroutine to truely run in the background (how will that work with DatabaseRepository, is that thread safe?) Mutex needed?
func BackgroundJobSyncResourcesWrapper(
	parentContext context.Context,
	logger *logrus.Entry,
	databaseRepo database.DatabaseRepository,
	sourceCred *models.SourceCredential,
	callbackFn func(
		_backgroundJobContext context.Context,
		_logger *logrus.Entry,
		_databaseRepo database.DatabaseRepository,
		_sourceCred *models.SourceCredential,
	) (sourceModels.SourceClient, sourceModels.UpsertSummary, error),
) (sourceModels.UpsertSummary, error) {
	var resultErr error
	var backgroundJob *models.BackgroundJob

	//Begin Sync JobStatus update process
	//1. Check if the source is already syncing
	if sourceCred.LatestBackgroundJob != nil && sourceCred.LatestBackgroundJob.JobStatus == pkg.BackgroundJobStatusLocked {
		logger.Errorln("Sync operation already in progress, cannot continue.")
		return sourceModels.UpsertSummary{}, fmt.Errorf("sync operation already in progress, cannot continue")
	}

	//since there's no sync in progress, lets create a new background job
	//2. Create a new background job
	backgroundJob = models.NewSyncBackgroundJob(*sourceCred)
	err := databaseRepo.CreateBackgroundJob(parentContext, backgroundJob)
	if err != nil {
		resultErr = fmt.Errorf("an error occurred while creating background job: %w", err)
		logger.Errorln(resultErr)
		return sourceModels.UpsertSummary{}, resultErr
	}
	backgroundJobContext := CreateBackgroundJobContext(parentContext, backgroundJob.ID.String())

	//3. Update the source with the background job id
	sourceCred.LatestBackgroundJobID = &backgroundJob.ID
	err = databaseRepo.UpdateSource(backgroundJobContext, sourceCred)
	if err != nil {
		logger.Warn("An error occurred while registering background job id with source, ignoring", err)
		//we can safely ignore this error, because we'll be updating the status of the background job again later
	}

	// BEGIN FINALIZER
	defer func() {
		//finalizer function - update the sync status to completed (or failed depending on the error status)
		if sourceCred == nil {
			logger.Errorln("sync status finalizer unable to complete, SourceCredential is null, ignoring", err)
			return
		} else {
			//since we're finished with the sync (no matter the final status), we can clear the active background job id
			sourceCred.LatestBackgroundJobID = nil

			//this will also update the AccessToken & RefreshToken if they have been updated
			err := databaseRepo.UpdateSource(backgroundJobContext, sourceCred)
			if err != nil {
				logger.Errorln("sync status finalizer failed updating source, ignoring", err)
			}
		}

		//update the backgroundJob status to completed or failed
		if backgroundJob == nil {
			logger.Errorln("sync status finalizer unable to complete, BackgroundJob is null, ignoring", err)
			return
		} else {

			//first, try to update the background job with the latest data
			updatedBackgroundJob, err := databaseRepo.GetBackgroundJob(backgroundJobContext, backgroundJob.ID.String())
			if err == nil {
				//replace the current background job, with the updated one.
				backgroundJob = updatedBackgroundJob
			}

			if resultErr == nil {
				backgroundJob.JobStatus = pkg.BackgroundJobStatusDone
			} else {
				//if there's an error that we need to store, lets unmarshal the data from the backgroundjob
				var backgroundJobSyncData models.BackgroundJobSyncData
				if backgroundJob.Data != nil {
					err = json.Unmarshal(backgroundJob.Data, &backgroundJobSyncData)
				}

				//ensure there's a map to store the error data
				if backgroundJobSyncData.ErrorData == nil {
					backgroundJobSyncData.ErrorData = map[string]interface{}{}
				}
				backgroundJobSyncData.ErrorData["final"] = resultErr.Error()

				//marshal the new background job data
				backgroundJob.Data, err = json.Marshal(backgroundJobSyncData)
				backgroundJob.JobStatus = pkg.BackgroundJobStatusFailed
			}
			now := time.Now()
			backgroundJob.DoneTime = &now
			backgroundJob.LockedTime = nil

			err = databaseRepo.UpdateBackgroundJob(backgroundJobContext, backgroundJob)
			if err != nil {
				logger.Errorln("sync status finalizer failed updating background job, ignoring", err)
			}
		}

	}()
	// END FINALIZER

	var sourceClient sourceModels.SourceClient
	var summary sourceModels.UpsertSummary
	sourceClient, summary, resultErr = callbackFn(backgroundJobContext, logger, databaseRepo, sourceCred)
	if resultErr != nil {
		logger.Errorln("An error occurred while syncing resources, ignoring", resultErr)
		return summary, resultErr
	}

	//update source incase the access token/refresh token has been updated
	sourceCredential := sourceClient.GetSourceCredential()
	sourceCredentialConcrete, ok := sourceCredential.(*models.SourceCredential)
	if !ok {
		resultErr = fmt.Errorf("an error occurred while updating source credential, source credential is not of type *models.SourceCredential")
		logger.Errorln(resultErr)
		return summary, resultErr
	}
	sourceCred = sourceCredentialConcrete

	//updated credentials will be saved by the finalizer
	return summary, resultErr
}

// Handlers

func ListBackgroundJobs(c *gin.Context) {
	logger := c.MustGet(pkg.ContextKeyTypeLogger).(*logrus.Entry)
	databaseRepo := c.MustGet(pkg.ContextKeyTypeDatabase).(database.DatabaseRepository)

	backgroundJobQueryOptions := models.BackgroundJobQueryOptions{}
	if len(c.Query("limit")) == 0 {
		backgroundJobQueryOptions.Limit = pkg.ResourceListPageSize
	} else {
		limit, err := strconv.Atoi(c.Query("limit"))
		if err != nil {
			logger.Errorln("An error occurred while calculating limit", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
		if limit == 0 {
			backgroundJobQueryOptions.Limit = pkg.ResourceListPageSize
		} else {
			backgroundJobQueryOptions.Limit = limit
		}
	}
	if len(c.Query("jobType")) > 0 {
		jobType := pkg.BackgroundJobType(c.Query("jobType"))
		backgroundJobQueryOptions.JobType = &jobType
	}
	if len(c.Query("status")) > 0 {
		status := pkg.BackgroundJobStatus(c.Query("status"))
		backgroundJobQueryOptions.Status = &status
	}

	if len(c.Query("page")) > 0 {
		pageNumb, err := strconv.Atoi(c.Query("page"))
		if err != nil {
			logger.Errorln("An error occurred while calculating page number", err)
			c.JSON(http.StatusInternalServerError, gin.H{"success": false})
			return
		}
		backgroundJobQueryOptions.Offset = pageNumb * backgroundJobQueryOptions.Limit
	}
	backgroundJobs, err := databaseRepo.ListBackgroundJobs(c, backgroundJobQueryOptions)

	if err != nil {
		logger.Errorln("An error occurred while retrieving resources", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": backgroundJobs})
}

// Utilities

func GetBackgroundContext(ginContext *gin.Context) context.Context {
	return context.WithValue(context.Background(), pkg.ContextKeyTypeAuthUsername, ginContext.Value(pkg.ContextKeyTypeAuthUsername).(string))
}

func CreateBackgroundJobContext(parentContext context.Context, backgroundJobId string) context.Context {
	return context.WithValue(parentContext, pkg.ContextKeyTypeBackgroundJobID, backgroundJobId)
}
