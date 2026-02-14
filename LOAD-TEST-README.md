# Load Testing from Remote Machine

## Files to Copy
- `load-test-remote.js` - k6 script with multiple endpoints

## Prerequisites
Install k6 or use Docker.

### Option A: Install k6
```bash
# Windows (chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

### Option B: Use Docker (no install needed)
Just have Docker installed.

---

## Running the Load Test

Replace `SERVER_IP` with your nodeserver's IP address (e.g., `192.168.1.100:3000`).

### With k6 installed:
```bash
# Basic: 3 minutes, 50 concurrent users
k6 run -e SERVER=SERVER_IP:3000 load-test-remote.js

# Custom duration and users
k6 run -e SERVER=SERVER_IP:3000 -e DURATION=5m -e VUS=100 load-test-remote.js

# Heavy load: 10 minutes, 200 concurrent users
k6 run -e SERVER=SERVER_IP:3000 -e DURATION=10m -e VUS=200 load-test-remote.js
```

### With Docker:
```bash
# Windows PowerShell
Get-Content load-test-remote.js | docker run --rm -i grafana/k6 run -e SERVER=SERVER_IP:3000 -

# Linux/macOS
cat load-test-remote.js | docker run --rm -i grafana/k6 run -e SERVER=SERVER_IP:3000 -

# Or mount the file
docker run --rm -v ${PWD}:/scripts grafana/k6 run -e SERVER=SERVER_IP:3000 /scripts/load-test-remote.js
```

---

## Quick Single-Endpoint Tests with `hey`

```bash
# 1000 requests, 50 concurrent
docker run --rm williamyeh/hey -n 1000 -c 50 http://SERVER_IP:3000/tx/r4/metadata

# 3 minutes duration, 100 concurrent
docker run --rm williamyeh/hey -z 180s -c 100 http://SERVER_IP:3000/tx/r4/metadata

# SNOMED lookup
docker run --rm williamyeh/hey -z 180s -c 50 "http://SERVER_IP:3000/tx/r4/CodeSystem/\$lookup?system=http://snomed.info/sct&code=73211009"
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SERVER | localhost:3000 | Server address (host:port) |
| DURATION | 3m | Test duration (e.g., 30s, 5m, 1h) |
| VUS | 50 | Number of virtual users (concurrent) |

---

## Example Output

```
================================================================================
                           LOAD TEST RESULTS
================================================================================
Target Server: 192.168.1.100:3000
Duration: 3m
Virtual Users: 50

REQUESTS:
  Total:      15234
  Rate:       84.63/s
  Failed:     0.00%

RESPONSE TIMES:
  Average:    45.23ms
  Min:        12.10ms
  Max:        234.50ms
  p(90):      78.40ms
  p(95):      95.20ms
================================================================================
```
