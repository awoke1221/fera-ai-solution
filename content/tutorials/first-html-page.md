---
title: Building Your First HTML Page
excerpt: Create a complete, functional HTML page from scratch with proper structure and semantic markup
section: Web Basics
lesson: 2
difficulty: beginner
tags: html, structure, semantic, markup
content_type: markdown
date: 2026-08-18
---

# Building Your First HTML Page

Now that you understand HTML basics, let's build a complete, professional webpage. You'll learn proper structure, semantic markup, and best practices.

## Project Overview

We'll create a simple personal portfolio page that includes:

- A header with navigation
- A hero section with introduction
- An about section
- A projects showcase
- A contact section
- A footer

## HTML Page Structure

Every HTML page follows a standard structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- Content goes here -->
    <script src="script.js"></script>
  </body>
</html>
```

### Understanding Each Part

**DOCTYPE Declaration**: Tells the browser this is HTML5

```html
<!DOCTYPE html>
```

**HTML Element**: Root container for all content

```html
<html lang="en"></html>
```

**Head Section**: Contains metadata and links

```html
<head>
  <meta charset="UTF-8" />
  <!-- Character encoding -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- Mobile responsive -->
  <title>Page Title</title>
  <!-- Browser tab title -->
  <link rel="stylesheet" href="style.css" />
  <!-- CSS file -->
</head>
```

**Body Section**: Contains all visible content

```html
<body>
  <!-- Your page content -->
</body>
```

## Building Semantic HTML

Semantic HTML uses meaningful tags that describe content:

### Header Section

```html
<header>
  <nav>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
</header>
```

### Hero Section

```html
<section class="hero">
  <h1>Welcome to My Portfolio</h1>
  <p>I'm a web developer passionate about creating beautiful websites.</p>
  <a href="#projects" class="cta-button">View My Work</a>
</section>
```

### About Section

```html
<section id="about">
  <h2>About Me</h2>
  <p>
    With over 3 years of web development experience, I've worked on projects
    ranging from small business websites to large-scale applications.
  </p>

  <h3>Skills</h3>
  <ul>
    <li>HTML & CSS</li>
    <li>JavaScript & React</li>
    <li>Web Design</li>
    <li>Responsive Design</li>
  </ul>
</section>
```

### Projects Section

```html
<section id="projects">
  <h2>Featured Projects</h2>

  <article class="project">
    <h3>E-Commerce Platform</h3>
    <p>A full-featured online store built with React and Node.js</p>
    <a href="#" class="project-link">View Project →</a>
  </article>

  <article class="project">
    <h3>Task Management App</h3>
    <p>A collaborative task manager with real-time updates</p>
    <a href="#" class="project-link">View Project →</a>
  </article>
</section>
```

### Contact Section

```html
<section id="contact">
  <h2>Get In Touch</h2>
  <form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required />

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required />

    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="5" required></textarea>

    <button type="submit">Send Message</button>
  </form>
</section>
```

### Footer Section

```html
<footer>
  <p>&copy; 2024 My Portfolio. All rights reserved.</p>
  <ul>
    <li><a href="https://twitter.com">Twitter</a></li>
    <li><a href="https://linkedin.com">LinkedIn</a></li>
    <li><a href="https://github.com">GitHub</a></li>
  </ul>
</footer>
```

## Complete Page Example

Here's a complete HTML page you can use as a template:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Portfolio</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <!-- Header with Navigation -->
    <header class="header">
      <nav class="navbar">
        <div class="logo">My Portfolio</div>
        <ul class="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="hero" id="home">
      <h1>Welcome!</h1>
      <p>I create beautiful, functional websites</p>
      <a href="#projects" class="btn">Explore My Work</a>
    </section>

    <!-- About Section -->
    <section class="about" id="about">
      <h2>About Me</h2>
      <p>Full-stack web developer with expertise in modern technologies.</p>
    </section>

    <!-- Projects Section -->
    <section class="projects" id="projects">
      <h2>My Projects</h2>
      <div class="projects-grid">
        <article class="project-card">
          <h3>Project One</h3>
          <p>Description of your project</p>
        </article>
        <article class="project-card">
          <h3>Project Two</h3>
          <p>Description of your project</p>
        </article>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact" id="contact">
      <h2>Contact Me</h2>
      <form>
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Your Message" rows="5" required></textarea>
        <button type="submit">Send</button>
      </form>
    </section>

    <!-- Footer -->
    <footer>
      <p>&copy; 2024 My Portfolio. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
  </body>
</html>
```

## Accessibility Tips

- Use proper heading hierarchy (h1 → h2 → h3)
- Add alt text to images: `<img src="photo.jpg" alt="Description">`
- Use semantic HTML tags (header, nav, main, section, article, footer)
- Include proper form labels and IDs
- Ensure sufficient color contrast

## Common Elements Reference

| Element     | Purpose      | Example                             |
| ----------- | ------------ | ----------------------------------- |
| `<p>`       | Paragraph    | `<p>Text content</p>`               |
| `<h1>-<h6>` | Headings     | `<h2>Subheading</h2>`               |
| `<a>`       | Links        | `<a href="page.html">Link</a>`      |
| `<img>`     | Images       | `<img src="photo.jpg" alt="Photo">` |
| `<div>`     | Container    | `<div class="container">...</div>`  |
| `<ul>/<ol>` | Lists        | `<ul><li>Item</li></ul>`            |
| `<form>`    | Forms        | `<form>...</form>`                  |
| `<input>`   | Input fields | `<input type="text">`               |
| `<button>`  | Buttons      | `<button>Click</button>`            |

## Validation and Testing

Always validate your HTML:

1. Use the W3C Validator: https://validator.w3.org/
2. Check in multiple browsers
3. Test on mobile devices
4. Use browser DevTools (F12)

## Next Steps

With a solid HTML foundation, you're ready to:

- Style your page with CSS
- Add interactivity with JavaScript
- Learn responsive design
- Deploy your website online
- Explore advanced HTML5 features

Keep coding and building! 💻
