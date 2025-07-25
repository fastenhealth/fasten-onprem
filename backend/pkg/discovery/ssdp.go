package discovery

import (
	"fmt"
	"github.com/koron/go-ssdp"
	"github.com/sirupsen/logrus"
	"time"
)

type SsdpService struct {
	log *logrus.Entry
	ad  *ssdp.Advertiser
}

func NewSsdpService(log *logrus.Entry) (*SsdpService, error) {
	return &SsdpService{
		log: log,
	}, nil
}

func (s *SsdpService) Start(host string, port int) error {
	s.log.Info("starting ssdp service")
	var err error
	s.ad, err = ssdp.Advertise(
		"urn:fasten-onprem:service:api:1",
		"uuid:fasten-onprem",
		fmt.Sprintf("http://%s:%d/device.xml", host, port),
		"fasten-onprem",
		1800)
	if err != nil {
		return err
	}

	go func() {
		aliveTick := time.Tick(300 * time.Second)
		for {
			select {
			case <-aliveTick:
				if err := s.ad.Alive(); err != nil {
					s.log.Error(err)
				}
			}
		}
	}()
	return nil
}

func (s *SsdpService) Stop() error {
	s.log.Info("stopping ssdp service")
	if s.ad != nil {
		if err := s.ad.Bye(); err != nil {
			return err
		}
		return s.ad.Close()
	}
	return nil
}
