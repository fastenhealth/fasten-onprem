#!/bin/bash

# Function to detect the IP address
detect_ip() {
    IP_ADDR="localhost"

    UNAME_OUT="$(uname -s)"
    case "${UNAME_OUT}" in
        Darwin*)
            IP_ADDR=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
            ;;
        Linux*)
            # Detect if running under WSL
            if grep -qi microsoft /proc/version 2>/dev/null; then
                # WSL: Use Windows ipconfig and parse output
                IP_ADDR=$(powershell.exe -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1 -ExpandProperty IPAddress" | tr -d '\r')
            else
                IP_ADDR=$(ip -4 addr show $(ip route | grep default | awk '{print $5}') | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}')
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*)
            # Git Bash or similar on Windows
            IP_ADDR=$(ipconfig.exe | grep -E "IPv4 Address|IPv4-adresse" | grep -v "127.0.0.1" | head -n 1 | awk -F: '{print $2}' | xargs)
            ;;
        *)
            # Fallback for other systems
            IP_ADDR=$(hostname -I | awk '{print $1}')
            ;;
    esac

    if [[ -z "$IP_ADDR" ]]; then
        IP_ADDR="localhost"
    fi

    echo "$IP_ADDR"
}

export FASTEN_EXTERNAL_HOST=$(detect_ip)

echo "Starting Fasten with external IP: $FASTEN_EXTERNAL_HOST"

docker-compose up
