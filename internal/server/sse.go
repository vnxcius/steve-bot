package server

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/vnxcius/steve-bot/helpers"
	"github.com/vnxcius/steve-bot/internal/config"
)

type sseMessage struct {
	Status string `json:"status"`
}

var (
	notificationChannelID string
	statusMutex           sync.RWMutex
	currentServerStatus   string = "unknown"
)

func establishSSEConnection(url string) (*http.Response, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create SSE request: %w", err)
	}
	req.Header.Set("Accept", "text/event-stream")
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Connection", "keep-alive")

	client := &http.Client{Timeout: 0}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SSE endpoint %s: %w", url, err)
	}

	if resp.StatusCode != http.StatusOK {
		resp.Body.Close()
		return nil, fmt.Errorf("SSE connection failed: Server responded with %s", resp.Status)
	}

	return resp, nil
}

func processSSEStream(s *discordgo.Session, resp *http.Response) {
	defer resp.Body.Close()
	slog.Info("SSE connection established successfully.")
	reader := bufio.NewReader(resp.Body)

	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			slog.Error("Error reading from SSE stream", "error", err)
			handleStatusUpdate(s, "LOST CONNECTION")
			return
		}

		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}

		if strings.HasPrefix(line, "data:") {
			jsonData := strings.TrimPrefix(line, "data:")
			jsonData = strings.TrimSpace(jsonData)

			if jsonData == "" {
				slog.Info("Received empty data line from SSE.")
				continue
			}

			var msg sseMessage
			err := json.Unmarshal([]byte(jsonData), &msg)
			if err != nil {
				slog.Error("Failed to decode SSE JSON", "error", err, "data", jsonData)
				continue
			}

			handleStatusUpdate(s, msg.Status)
		}
	}
}

func ConnectToSSE(s *discordgo.Session) {
	if s == nil {
		slog.Error("CRITICAL ERROR: ConnectToSSE started with a nil Discord session. Aborting SSE connection.")
		return
	}

	sseURL := os.Getenv("API_URL") + "/v2/server-status-stream"
	notificationChannelID = os.Getenv("NOTIFICATION_CHANNEL_ID")
	slog.Info("Notification channel ID: " + notificationChannelID)

	const initialRetryDelay = 10 * time.Second
	const maxRetryDelay = 1 * time.Hour // Cap delay at 1 hour
	const delayAfterLoss = 30 * time.Second
	currentRetryDelay := initialRetryDelay

	slog.Info("Attempting to connect to SSE endpoint", "url", sseURL)
	for {
		resp, err := establishSSEConnection(sseURL)
		if err != nil {
			slog.Error(
				"SSE connection attempt failed. Retrying...",
				"error",
				err,
				"delay",
				currentRetryDelay,
			)
			time.Sleep(currentRetryDelay)

			currentRetryDelay *= 2
			if currentRetryDelay > maxRetryDelay {
				currentRetryDelay = maxRetryDelay
			}
			continue
		}
		currentRetryDelay = initialRetryDelay
		processSSEStream(s, resp)

		slog.Warn(
			"SSE connection lost. Waiting before reconnecting...",
			"delay",
			delayAfterLoss,
		)
		time.Sleep(delayAfterLoss)
	}
}

func handleStatusUpdate(s *discordgo.Session, newStatus string) {
	if s == nil {
		slog.Error("CRITICAL ERROR: ConnectToSSE started with a nil Discord session. Aborting SSE connection.")
		return
	}
	statusMutex.Lock()
	defer statusMutex.Unlock()

	oldStatus := currentServerStatus
	if oldStatus != newStatus {
		currentServerStatus = newStatus
		timestamp := helpers.GetTimeNow()
		slog.Info("Server status updated", "old", oldStatus, "new", newStatus)

		emoji := helpers.GetStatusEmoji(newStatus)

		if notificationChannelID != "" && oldStatus != "unknown" {
			message := fmt.Sprintf("`%s UPDATE: SERVER %s %s`",
				timestamp,
				config.TitleCaser.String(newStatus),
				emoji,
			)
			_, err := s.ChannelMessageSend(notificationChannelID, message)
			if err != nil {
				slog.Error("Failed to send SSE notification to channel", "error", err)
			}
		}
	}
}

func GetCurrentStatusThreadSafe() string {
	statusMutex.RLock()
	defer statusMutex.RUnlock()
	return currentServerStatus
}
