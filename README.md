# Bimlendra Ray - Robotics and Controls Portfolio

A responsive engineering portfolio presenting Bimlendra Ray's work in robotics,
autonomous systems, model predictive control, simulation, and dynamic systems.

The site is designed for technical recruiters, hiring teams, and engineering
collaborators. It provides a concise professional overview and dedicated project
pages that explain the engineering challenge, system architecture, implementation,
results, technologies, and available evidence.

## Features

- Professional robotics and controls profile
- Responsive desktop, tablet, and mobile layouts
- Dedicated detail page for every featured project
- System architecture and engineering workflow presentation
- Downloadable technical reports and resume
- Project plots, images, and simulation video support
- Image lightbox for detailed result inspection
- Research, industry experience, education, and technical stack sections
- LinkedIn, GitHub, email, and phone contact links
- No backend, database, or external API required

## Featured Projects

- Hybrid Control of a Legged Robot in MuJoCo
- End-to-End Autonomous Vehicle Control and Planning System using Quanser QCar
- Neural Approximation of Constrained MPC through Imitation Learning
- Disturbance-Aware Lap-Time Optimization using MPC
- AL-iLQR Trajectory Following with Chance-Constrained Obstacle Avoidance
- PLC Production-Line Object Counting
- Agri Sort Robotic Classification System
- TurtleBot3 Trajectory Tracking using ROS

## Technology

- React 18
- Create React App / React Scripts
- JavaScript and JSX
- CSS3 with responsive media queries
- React Testing Library and Jest
- Browser hash routing

The project pages use hash-based URLs such as:

```text
#/projects/mujoco-legged-robot
#/projects/qcar
#/projects/turtlebot3-ros
```

Hash routing allows the portfolio to work on static hosting without server-side
route configuration.

## Project Structure

```text
.
|-- public/
|   |-- Bimlendra_Ray_Resume_RAC.pdf
|   |-- index.html
|   |-- manifest.json
|   `-- static branding assets
|-- src/
|   |-- Proj-agri-sort/
|   |-- Proj-al-ilqr/
|   |-- Proj-lap-time-mpc/
|   |-- Proj-qcar/
|   |-- Proj-turtlebot3-ros/
|   |-- images/
|   |-- App.js
|   |-- App.css
|   |-- App.test.js
|   |-- index.js
|   `-- setupTests.js
|-- package.json
|-- package-lock.json
`-- README.md
```

## Local Development

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

Clone the repository and install the locked dependencies:

```bash
git clone https://github.com/bhimray/bilen-profile-1.git
cd bilen-profile-1
npm ci
```

Use `npm install` instead when intentionally changing dependencies.

### Start the Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). The page reloads
automatically when source files change.

## Available Commands

```bash
npm start
```

Runs the local development server.

```bash
npm test -- --watchAll=false
```

Runs the complete test suite once.

```bash
npm run build
```

Creates an optimized production build in `build/`.

```bash
npm run eject
```

Exposes the Create React App configuration. This is irreversible and is not
required for normal development.

## Updating Portfolio Content

Most portfolio content is defined in `src/App.js`.

### Add or Edit a Project

Update the `projects` array. Each project uses this structure:

```js
{
  id: 'project-url-id',
  title: 'Project title',
  overview: 'Short recruiter-facing summary.',
  platform: 'Organization | Date range',
  problem: 'Engineering problem being solved.',
  approach: 'Implementation and design approach.',
  architecture: 'Input -> Processing -> Control -> Output',
  technologies: ['Python', 'ROS', 'MPC'],
  features: ['Contribution one', 'Contribution two'],
  results: ['Measured result or validated outcome'],
  assets: {
    reports: [],
    images: [],
  },
  links: [],
}
```

The `id` becomes the project URL:

```text
#/projects/project-url-id
```

Keep IDs lowercase and use hyphens instead of spaces.

### Add a Technical Report

1. Place the PDF in the matching `src/Proj-*` directory.
2. Import it near the top of `src/App.js`.
3. Add it to the project's `assets.reports` array:

```js
reports: [
  {
    label: 'Technical Report',
    href: importedReport,
  },
]
```

### Add Project Images

1. Place the image in the matching project directory.
2. Import it in `src/App.js`.
3. Add it to `assets.images`:

```js
images: [
  {
    src: importedImage,
    alt: 'Accessible description of the result',
    caption: 'Short visible caption',
  },
]
```

Use descriptive `alt` text that explains what the image or plot demonstrates.

### Add Project Links

```js
links: [
  {
    label: 'GitHub Repository',
    href: 'https://github.com/example/project',
  },
]
```

External links open in a new browser tab. Internal links can use a section hash,
such as `#contact`.

### Update the Resume

The public resume is:

```text
public/Bimlendra_Ray_Resume_RAC.pdf
```

If the filename changes, update both the `href` and `download` values in
`src/App.js`.

### Update Profile or Contact Information

Search `src/App.js` for:

- `raybimlendra@gmail.com`
- `raybimlendra`
- `bhimray`
- `Richardson, Texas`

This covers the email, LinkedIn, GitHub, and location references currently
displayed on the site.

## Styling

The main visual system is defined in `src/App.css`.

Important areas include:

- Root colors and reusable design tokens
- Sticky navigation
- Profile hero and portrait composition
- Project preview cards
- Dedicated project detail pages
- Reports and evidence galleries
- Contact call to action
- Responsive breakpoints at `1100px`, `960px`, `760px`, and `640px`

Reuse existing classes and color variables before introducing new patterns.

## Testing

Tests are located in `src/App.test.js` and use React Testing Library.

Current coverage verifies:

- Main portfolio content renders
- A dedicated project route renders correctly
- The MuJoCo project page renders its engineering details

When adding routing behavior or important project-page content, add a focused
test that sets `window.location.hash` and verifies the expected page.

## Production Build

Run:

```bash
npm run build
```

The optimized static site is generated in `build/`. The build can be deployed
to any static hosting provider.

## Deployment

Suitable deployment targets include:

- Netlify
- Vercel
- GitHub Pages
- AWS S3 with static website hosting
- Any conventional static web server

Because project navigation uses URL hashes, no rewrite rule is needed for
project detail pages.

Before deployment:

1. Run `npm test -- --watchAll=false`.
2. Run `npm run build`.
3. Verify the resume, reports, images, and video assets.
4. Open several `#/projects/...` URLs directly.
5. Check the layout on desktop and mobile widths.
6. Confirm all external profile and repository links.

## Accessibility

- Images include descriptive alternative text.
- Interactive image previews use buttons.
- The image lightbox exposes dialog semantics.
- Links and buttons use visible text labels.
- Responsive layouts avoid requiring horizontal scrolling.

New content should preserve semantic headings, meaningful link names, keyboard
access, and sufficient color contrast.

## Contact

- Email: [raybimlendra@gmail.com](mailto:raybimlendra@gmail.com)
- LinkedIn: [linkedin.com/in/raybimlendra](https://www.linkedin.com/in/raybimlendra/)
- GitHub: [github.com/bhimray](https://github.com/bhimray)

## License

The source code and portfolio content are maintained for Bimlendra Ray's
personal professional portfolio. Project reports, resume content, photographs,
and other personal assets may not be reused without permission.
