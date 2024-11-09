![img](static/logo-header.png)

## 🦸 Holy plot points!

**Sidekick** is an app that helps storytellers map out their worlds. Create, describe, and connect your story's moments, characters, themes, and locations.

Currently under development for [SvelteHack 2024](https://hack.sveltesociety.dev/2024). This puts the target for release at January 10th, 2025

## 🌱 Project Status

This app is early in its journey. Here's the plan:

### **Core features**

- ✅ **100% local**: Your story is stored on your device and never sent to a server, AI dataset, or anywhere else you may not want it.
- ⏹️ **Export and import**: Easily save your story to a file, for safekeeping or to import on another device
- ⏹️ **Create story elements**: Flesh out your story with moments, themes, locations, and interrelated characters
    - ⏹️ **Moments**: Create and easily order story moments/scenes, each linking important characters, locations, and themes
    - ⏹️ **Themes**: Lay out over-arching ideas that tie your story together, and easily view them from anywhere in the app
    - ⏹️ **Characters**: Describe your story's characters with several useful prompts
    - ⏹️ **Character dynamics**: Link characters to each other and describe their relationship
    - ⏹️ **Locations**: Describe your story's vibrant settings

### **Feature backlog**

- ⏹️ **Live link suggestions**: When editing a story element, if you type the name of another element that has not been linked yet, that name is automatically highlighted with the option to either confirm that link or dismiss

## 🤔 Why?

Sidekick aims to provide an intuitive way for writers to plan important elements of their story, and to encourage users to think about how these elements work together and with the story as a whole.

## ✨ Getting started

Keep in mind this is a work in progress, and missing key features. If you're here for a functional app, please check again later

When core features are implemented, this app will be deployed and available online. If you'd prefer to run it on your own machine for any reason, you can always do so straight from the source:

1. Install [Git](https://git-scm.com/downloads) and [Node](https://nodejs.org/en) if necessary
2. Open a terminal in the folder where you'd like to download Sidekick, and run:

```bash
git clone https://github.com/dannymendiola/sidekick
cd sidekick
npm install
npm audit fix # if there are any scary vulnerabilities
npm run build
npm run preview
```

If the app doesn't open in your browser automatically, you can access it by entering `localhost:3000` in the browser address bar

To stop the app, type `q` in the running terminal and enter

## 🛠️ Contributing

Sidekick is currently a solo project as part of a hackathon, so I won't be looking at any contributions until after submission (January 10), and will not make any merges until after final results.

That said, contributions are welcome! If you have any ideas, feel free to open an issue or PR.

## 💡 Inspirations and Tools

Sidekick owes much of its inspiration and existence to several tools and projects. Check 'em out:

- Tools:
    - [Svelte](https://svelte.dev/) my beloved
    - [Tailwindcss](https://tailwindcss.com/) and their [icon library](https://heroicons.com/)
    - [Quill](https://quilljs.com/) for rich text
- Inspirations:
    - [Pluot](https://pluot.app/): story planning app for Android
    - [Obsidian](https://obsidian.md/): platform for a freeform network of notes
    - [Home for Fiction](https://homeforfiction.com)'s apps, especially [Narrative Nods](https://homeforfiction.com/apps/#nnods) 💵
    - [Some wise words](https://youtu.be/85LUuF6ZXaU)