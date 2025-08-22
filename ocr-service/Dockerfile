# ---------- Build Stage ----------
FROM golang:1.22-bookworm AS builder

# Install tesseract and development headers for Go to compile against
RUN apt-get update && apt-get install -y -qq \
    libleptonica-dev \
    libtesseract-dev \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

# Ensure Go modules are downloaded
RUN go mod download

# Build the Go binary
RUN go build -o ocr-service .

# ---------- Runtime Stage ----------
FROM debian:bookworm-slim

# Install only runtime dependencies
RUN apt-get update && apt-get install -y -qq \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/ocr-service /usr/local/bin/ocr-service

EXPOSE 8080

CMD ["ocr-service"]
