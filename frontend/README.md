# Physical AI & Humanoid Robotics Book - Frontend

This is the frontend for the Physical AI & Humanoid Robotics book, built with Docusaurus. It provides an interactive learning platform for humanoid robotics concepts using ROS 2.

## Prerequisites

- [Node.js](https://nodejs.org/en/) version 18.0 or higher
- npm or yarn package manager

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

## Local Development

```bash
npm start
```
or
```bash
yarn start
```

This command starts a local development server and opens the application in your browser. Most changes are reflected live without having to restart the server.

## Build

```bash
npm build
```
or
```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static content hosting service.

## Deployment

Using SSH:
```bash
USE_SSH=true npm run deploy
```

Not using SSH:
```bash
GIT_USER=<Your GitHub username> npm run deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Project Structure

```
frontend/
├── docs/                    # Documentation files for the book
│   ├── module1-ros2/       # Module 1: The Robotic Nervous System (ROS 2)
│   │   ├── fundamentals/   # ROS 2 fundamentals content
│   │   ├── python-ros-bridge/ # Python-ROS integration content
│   │   ├── urdf-modeling/  # URDF modeling content
│   │   └── exercises/      # Exercise content
│   └── ...                 # Other modules
├── src/                    # Source files
│   ├── components/         # React components
│   ├── css/               # Custom CSS
│   └── pages/             # Additional pages
├── static/                 # Static assets
├── docusaurus.config.js    # Main configuration file
├── package.json           # Dependencies and scripts
└── sidebars.js            # Navigation sidebar configuration
```

## Contributing

This project follows the documentation structure for the Physical AI & Humanoid Robotics book. Content is organized by modules, with each module containing:

- Theoretical concepts
- Practical examples
- Exercises
- References

### Adding New Content

1. Create new markdown files in the appropriate module directory under `docs/`
2. Update `sidebars.js` to include the new content in the navigation
3. Follow the existing content structure and formatting

## Modules

### Module 1: The Robotic Nervous System (ROS 2)
- ROS 2 fundamentals (Nodes, Topics, Services)
- Python-ROS bridge using rclpy
- URDF modeling for humanoid robots
- Practical exercises and examples

## Technical Standards

- All content follows APA citation format
- Code examples are validated in ROS 2 environment
- Content meets academic rigor requirements (≥50% peer-reviewed sources)
- Content follows structured approach: Concepts → Theory → Setup → Implementation → Code → Exercises

## Deployment to Vercel

This project is configured for deployment to Vercel. The following settings are important for proper deployment:

### Configuration Notes

1. **Base URL**: The site is configured with `baseUrl: '/'` which works for root domain deployments
2. **URL**: The production URL is set to `https://nihal-hackathon-book.vercel.app`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`

### Troubleshooting Common Issues

**CSS/Assets Not Loading:**
- Ensure the `baseUrl` in `docusaurus.config.js` is correctly set for your deployment
- For Vercel deployments:
  - Root domain (e.g., `https://my-project.vercel.app`): Use `baseUrl: '/'`
  - Custom domain root: Use `baseUrl: '/'`
  - Subdirectory (e.g., `https://my-site.com/docs/`): Use `baseUrl: '/docs/'`

**Broken Links:**
- Make sure all internal links use relative paths
- Check that all navigation links are properly configured

**Vercel-Specific Configuration:**
- The `vercel.json` file is configured to handle SPA routing correctly
- Rewrites are set up to serve `index.html` for client-side routing
- Headers are optimized for caching

### Deployment Settings for Vercel

When deploying to Vercel, ensure the following settings:

- Framework Preset: `Other` or let auto-detect
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

For custom domains, make sure the URL in `docusaurus.config.js` matches your domain and the baseUrl is set appropriately.

## Support

For support, please open an issue in the main repository.