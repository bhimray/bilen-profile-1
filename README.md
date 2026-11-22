# Bimlendra Ray · Controls Engineer

An Astro Sphere portfolio focused on dSPACE system integration, vehicle controls research, and HIL/virtual validation. The content follows `Bimlendra_Ray_HIL_Resume.docx`.

## Run locally

With Node.js and npm installed, open PowerShell in this folder.

```powershell
npm.cmd install
npm.cmd run dev
```

Open [localhost:4321](http://localhost:4321). Run `npm.cmd run build` to build the static site and `npm.cmd run preview` to preview that build.

## Edit content

| What to change | Location |
|---|---|
| Research and engineering case studies | `src/content/projects/*.md` |
| Research affiliation, manuscript, skills, experience, and education | `src/data/resume-profile.json` |
| Name, focus, and professional links | `src/consts.ts` |
| Homepage introduction | `src/pages/index.astro` |
| Downloadable résumé | `public/Bimlendra_Ray_HIL_Resume.docx` |

Keep a case study’s filename to preserve its URL. The homepage redirects historical `/#/projects/<slug>` links to the matching case study or to the project index.

Set `$env:SITE_URL` to your public origin before building to generate canonical URLs and a sitemap. The site assumes hosting at the root of a domain.

The portfolio links to the [bhimray GitHub profile](https://github.com/bhimray), the [earlier React portfolio](https://github.com/bhimray/bilen-profile-1), and the [autonomous racing project source](https://github.com/bhimray/racing_car). Use a separate branch or repository when publishing this Astro source so the React version stays available.

Based on the MIT-licensed [Astro Sphere template](https://github.com/markhorn-dev/astro-sphere).
