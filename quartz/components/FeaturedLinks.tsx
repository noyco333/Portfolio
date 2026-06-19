import { QuartzComponent, QuartzComponentConstructor } from "./types"

const FeaturedLinks: QuartzComponent = () => {
  return (
    <nav class="featured-links">
      <h3>Featured</h3>
      <ul>
        <li><a href="/selected-works">Selected Works</a></li>
        <li><a href="/drift-abyss">Drift Abyss</a></li>
        <li><a href="/projects">Projects</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  )
}

export default (() => FeaturedLinks) satisfies QuartzComponentConstructor