# Corsair Xeneon Edge - Custom Control Dashboard

A custom monorepo project to control Windows System Audio, HDR, and more from the Corsair Xeneon Edge's iCUE integration (via a Linux Home Server).

## Architecture

1.  **Windows Agent (`packages/agent`)**: Runs invisibly on your Gaming PC to control hardware (Audio/HDR).
2.  **Web Dashboard (`packages/dashboard`)**: Hosted on your Linux Home Server (Docker) to display the UI on the Xeneon Edge.

---

## 🚀 Setup Instructions

### 1. On Gaming PC (The machine you want to control)

**Prerequisites:**

- Node.js Installed.
- `svcl.exe` (SoundVolumeView Command Line) placed in `packages/agent/bin/svcl.exe`.

**Installation:**

1.  Open PowerShell as Administrator.
2.  Navigate to this repo.
3.  Install and start the service:
    ```powershell
    npm install
    npm run build --workspace=packages/agent
    npm run install-service --workspace=packages/agent
    ```
4.  Get your Local IP Address (`ipconfig`). You will need this for step 2.

---

### 2. On Linux Home Server (Hosting the UI)

**Prerequisites:**

- Docker installed.

**Installation:**

1.  Clone this repo:

    ```bash
    git clone git@github.com:Saikedo/Xenon-Edge.git
    cd Xenon-Edge
    cd icue-control-monorepo
    ```

2.  Build the Docker Image:
    _Replace `192.168.1.XX` with your Gaming PC's IP address._

    ```bash
    docker build -f packages/dashboard/Dockerfile --build-arg VITE_AGENT_URL="http://192.168.1.XX:4000" -t xeneon-dashboard .
    ```

3.  Run the Container:
    ```bash
    docker run -d -p 3000:80 --restart always xeneon-dashboard
    ```

---

## 3. iCUE Setup (On Gaming PC)

1.  Open iCUE.
2.  Select **Xeneon Edge**.
3.  Add a **"Web View"** widget.
4.  Set the URL to your server: `http://YOUR_SERVER_IP:3000` (e.g., `http://192.168.1.50:3000`).
