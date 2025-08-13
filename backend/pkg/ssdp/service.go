package ssdp

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/fastenhealth/fasten-onprem/backend/pkg/config"
	"github.com/sirupsen/logrus"
)

const (
	DISCOVERY_PORT = 1901 // Different port to avoid conflicts
)

type SSDPService struct {
	config     config.Interface
	logger     *logrus.Entry
	serverAddr string
	serverPort string
	ctx        context.Context
	cancel     context.CancelFunc
	listener   net.Listener
}

func NewSSDPService(config config.Interface, logger *logrus.Entry, serverAddr, serverPort string) *SSDPService {
	ctx, cancel := context.WithCancel(context.Background())
	return &SSDPService{
		config:     config,
		logger:     logger,
		serverAddr: serverAddr,
		serverPort: serverPort,
		ctx:        ctx,
		cancel:     cancel,
	}
}

func (s *SSDPService) Start() error {
	s.logger.Info("Starting simple network discovery service for mobile apps")

	// Start simple TCP discovery service
	go s.startDiscoveryService()

	// Start network broadcast
	go s.broadcastPresence()

	s.logger.Info("Network discovery service started successfully")
	return nil
}

func (s *SSDPService) Stop() {
	s.logger.Info("Stopping network discovery service")
	if s.cancel != nil {
		s.cancel()
	}
	if s.listener != nil {
		s.listener.Close()
	}
}

func (s *SSDPService) startDiscoveryService() {
	s.logger.Info("Starting TCP discovery service on port 1901")
	
	// Listen on TCP port for discovery requests
	listener, err := net.Listen("tcp", ":1901")
	if err != nil {
		s.logger.Errorf("Failed to start discovery service: %v", err)
		return
	}
	s.listener = listener
	defer listener.Close()

	for {
		select {
		case <-s.ctx.Done():
			s.logger.Info("Discovery service stopped")
			return
		default:
			conn, err := listener.Accept()
			if err != nil {
				s.logger.Errorf("Failed to accept connection: %v", err)
				continue
			}
			
			go s.handleDiscoveryRequest(conn)
		}
	}
}

func (s *SSDPService) handleDiscoveryRequest(conn net.Conn) {
	defer conn.Close()
	
	s.logger.Infof("Discovery request from %s", conn.RemoteAddr())
	
	// Send server info
	response := fmt.Sprintf(`{
		"server": "Fasten Health Server",
		"version": "1.0.0",
		"endpoints": {
			"sync": "http://%s:%s/api/mobile/sync",
			"health": "http://%s:%s/api/health"
		},
		"timestamp": "%s"
	}`, s.serverAddr, s.serverPort, s.serverAddr, s.serverPort, time.Now().Format(time.RFC3339))
	
	conn.Write([]byte(response))
	s.logger.Infof("Sent discovery response to %s", conn.RemoteAddr())
}

func (s *SSDPService) broadcastPresence() {
	// Wait a bit for the service to fully start
	time.Sleep(3 * time.Second)

	s.logger.Info("Broadcasting network presence")
	
	// Send UDP broadcast to local network
	interfaces, err := net.Interfaces()
	if err != nil {
		s.logger.Errorf("Failed to get network interfaces: %v", err)
		return
	}

	for _, iface := range interfaces {
		if iface.Flags&net.FlagUp != 0 && iface.Flags&net.FlagBroadcast != 0 {
			addrs, err := iface.Addrs()
			if err != nil {
				continue
			}
			
			for _, addr := range addrs {
				if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
					if ipnet.IP.To4() != nil {
						// Get broadcast address
						broadcastIP := s.getBroadcastIP(ipnet)
						if broadcastIP != nil {
							s.sendBroadcast(broadcastIP)
						}
					}
				}
			}
		}
	}
}

func (s *SSDPService) getBroadcastIP(ipnet *net.IPNet) net.IP {
	ip := ipnet.IP.To4()
	if ip == nil {
		return nil
	}
	
	mask := ipnet.Mask
	broadcast := make(net.IP, len(ip))
	for i := range ip {
		broadcast[i] = ip[i] | ^mask[i]
	}
	return broadcast
}

func (s *SSDPService) sendBroadcast(broadcastIP net.IP) {
	conn, err := net.DialUDP("udp", nil, &net.UDPAddr{
		IP:   broadcastIP,
		Port: 1901,
	})
	if err != nil {
		s.logger.Debugf("Failed to create UDP connection for broadcast: %v", err)
		return
	}
	defer conn.Close()

	message := fmt.Sprintf("FASTEN_SERVER:%s:%s", s.serverAddr, s.serverPort)
	_, err = conn.Write([]byte(message))
	if err != nil {
		s.logger.Debugf("Failed to send broadcast: %v", err)
	} else {
		s.logger.Infof("Broadcasted presence to %s", broadcastIP)
	}
}
