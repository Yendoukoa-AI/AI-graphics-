# DesignAI Studio

DesignAI Studio is an AI-powered design platform dedicated to the modern creator. It leverages artificial intelligence to revolutionize workflows in web design, graphic design, Photoshop enhancements, and poster creation.

## 📢 Latest News: Super Release v1.2.0 is Here!

We are excited to announce our super release! **DesignAI Studio v1.2.0** is now live with enhanced authentication.

- **View on GitHub Session**: [v1.2.0](https://github.com/GYFX35/AI-graphics-/releases/tag/v1.2.0)
- **Artifact**: [Download release-v1.2.0.tar.gz](https://github.com/GYFX35/AI-graphics-/releases/download/v1.2.0/release-v1.2.0.tar.gz)

### What's New in v1.2.0
- **User Authentication**: Secure login and registration to save your progress.
- **Social Login**: Continue with Google or Facebook for a seamless experience.
- **Auth Nudge**: Intelligent reminders to connect your account and unlock persistent storage.

## 🚀 Features

- **🌐 Web Design AI**: Generate responsive layouts, UI components, and complete landing pages from simple text descriptions.
- **🎨 Graphic & Photoshop**: Advanced AI tools for image manipulation, background removal, and professional photo retouching.
- **🖼️ Affiches & Posters**: Create stunning public posters and advertisements with automated typography and layout balancing.
- **⚡ Real-time Generation**: Experience the power of AI with our integrated editor and see your ideas come to life instantly.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Styling**: CSS3

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd codespaces-react
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

In the project directory, you can run:

#### `npm start`
Runs the app in development mode using Vite.
Open [http://localhost:3000/](http://localhost:3000/) to view it in your browser.

#### `npm run build`
Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm test`
Launches the test runner (Vitest).

#### `npm run preview`
Locally preview the production build.

#### `npm run package`
Builds the project and creates a versioned release tarball (`release-vX.X.X.tar.gz`) along with a SHA-256 checksum for integrity verification.

## 📦 Artifacts & Security

We provide automated packaging and integrity verification tools to ensure the security of your deployments.

### 📥 Download Latest Release
You can download the latest production-ready artifact directly from our releases page:
- **[Download v1.2.0 Artifact](https://github.com/GYFX35/AI-graphics-/releases/download/v1.2.0/release-v1.2.0.tar.gz)**

### Generating a Release Artifact
To create a downloadable distribution package:
```bash
npm run package
```
This will generate:
- `release-v1.2.0.tar.gz`: The production-ready bundle.
- `release-v1.2.0.tar.gz.sha256`: A checksum file to verify the artifact.

### Verifying Integrity
To protect against unauthorized modifications, always verify the integrity of the downloaded artifact:
```bash
python3 scripts/verify_integrity.py release-v1.2.0.tar.gz
```
The tool will check the artifact against its SHA-256 hash and report any discrepancies.

## 📁 Project Structure

- `src/App.jsx`: Main application component containing the AI editor and landing page sections.
- `src/App.css`: Styles for the application, featuring a dark-themed UI.
- `public/`: Static assets.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
