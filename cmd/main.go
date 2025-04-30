package main

import (
	"log"
	"log/slog"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/vnxcius/steve-bot/internal/bot"
	"github.com/vnxcius/steve-bot/internal/commands"
	"github.com/vnxcius/steve-bot/internal/config"
)

const logFilePath = "./logs/system.log"

func init() {
	config.SetupLogger(logFilePath)

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	slog.Info("Loaded .env file")

	commands.AuthorizedUserIDs = make(map[string]bool)

	if os.Getenv("AUTHORIZED_USER_IDS") == "" {
		slog.Warn("AuthorizedUserIDs not found in config or is empty. No users will be authorized for protected commands.")
		return
	}

	idSlice := strings.Split(os.Getenv("AUTHORIZED_USER_IDS"), ",")

	loadedCount := 0
	// Correctly iterate over the SLICE VALUES
	for _, idStr := range idSlice {
		trimmedID := strings.TrimSpace(idStr)
		if trimmedID != "" {
			commands.AuthorizedUserIDs[trimmedID] = true
			loadedCount++
		}
	}

	if loadedCount > 0 {
		slog.Info("Successfully loaded authorized Discord User ID(s) from config.", "total", loadedCount)
	} else {
		slog.Warn("WARNING: Config AuthorizedUserIDs was set but contained no valid IDs after parsing.")
	}
}

func main() {
	slog.Info("Initialized logger")
	s, err := bot.StartBot()
	if err != nil {
		log.Fatal(err)
	}

	slog.Info("Bot is now running.  Press CTRL-C to exit.")

	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt)
	<-sc

	slog.Info("Gracefully shutting down bot...")
	commands.RemoveSlashCommands(s)

	slog.Info("Goodbye!")
}
