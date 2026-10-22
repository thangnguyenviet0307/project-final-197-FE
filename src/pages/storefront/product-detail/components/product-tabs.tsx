import { useState } from "react"
import type { StoreProduct } from "@/features/storefront/catalog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { descriptionToHtml } from "@/features/products/utils/product-description"

const tabs = ["Description", "Review", "Additional", "Video"] as const
type DetailTab = typeof tabs[number]
const asset = (name: string) => `/storefront/amanto/${name}`
const description = "Sed sodales sed orci molestie tristique. Nunc dictum, erat id molestie vestibulum, ex leo vestibulum justo, luctus tempor erat sem quis diam. Lorem ipsum dolor sit amet."
const secondaryDescription = "Nullam et massa nulla. Quisque nec magna ornare tellus consequat lacinia a quis sem. Vivamus ut posuere nunc. Praesent porttitor vitae augue in semper. Vestibulum non leo et nisi facilisis consequat."

function HeadphoneDescription() {
  return <div className="pd-description">
    <div className="pd-description-row"><div><img src={asset("headphes-grey.jpg")} alt="Headphone ear cup detail" loading="lazy" /><h3>NULLAM ET MASSA NULLA</h3><p>{description}</p></div><div><img src={asset("headphnes-grey.jpg")} alt="Headphone headband detail" loading="lazy" /><h3>VIVAMUS UT POSUERE NUNC</h3><p>{description}</p></div></div>
    <div className="pd-description-row"><div><h3>AENEAN A TINCIDUNT FELIS</h3><p>{description}</p><h3>NULLA SED ARCU IPSUM</h3><p>{secondaryDescription}</p></div><img src={asset("product-preview-12.png")} alt="Headphones viewed from the side" loading="lazy" /></div>
    <div className="pd-description-row"><img src={asset("product-preview-15.png")} alt="Headphones design and finish" loading="lazy" /><div><h3>AENEAN A TINCIDUNT FELIS</h3><p>{description}</p><h3>NULLA SED ARCU IPSUM</h3><p>{secondaryDescription}</p></div></div>
  </div>
}

export function ProductTabs({ product }: { product: StoreProduct }) {
  const [active, setActive] = useState<DetailTab>("Description")
  const blueSilence = product.source !== "api" && product.slug === "blue-silence"
  return <section className="pd-tabs" aria-label="Product details">
    <Tabs value={active} onValueChange={value => setActive(value as DetailTab)} className="gap-0">
      <TabsList activateOnFocus variant="line" className="pd-tab-list" aria-label="Product information tabs">{tabs.map(tab => <TabsTrigger className="pd-tab-trigger" key={tab} value={tab}>{tab}</TabsTrigger>)}</TabsList>
      <TabsContent value={active} className="pd-tab-panel">
      {active === "Description" && (product.source === "api" ? <div className="pd-api-description">{product.description ? <div dangerouslySetInnerHTML={{ __html: descriptionToHtml(product.description) }} /> : <p>No description has been provided for this product.</p>}</div> : blueSilence ? <HeadphoneDescription /> : <div className="pd-generic-description"><img src={product.image} alt={product.name} loading="lazy" /><div><h3>{product.name}</h3><p>Discover {product.name} in the Amanto {product.category} collection.</p><p>This demonstration product page uses the reference layout. Detailed manufacturer specifications have not been supplied for this item.</p></div></div>)}
      {active === "Review" && <div className="pd-reviews"><h3>Customer Reviews</h3><p>No reviews yet.</p><p className="pd-demo-note">Reviews are not connected to a service in this demo.</p></div>}
      {active === "Additional" && <table className="pd-specifications"><caption>Product information</caption><tbody><tr><th scope="row">Product</th><td>{product.name}</td></tr><tr><th scope="row">Category</th><td>{product.category}</td></tr>{blueSilence && <><tr><th scope="row">Color</th><td>Black, White, Blue, Green, Orange</td></tr><tr><th scope="row">Availability</th><td>White: Sold Out. Other colors available in the demo.</td></tr></>}{product.source === "api" ? <><tr><th scope="row">Brand</th><td>{product.brand}</td></tr><tr><th scope="row">Model year</th><td>{product.modelYear}</td></tr>{Boolean(product.options?.length) && <tr><th scope="row">Variants</th><td>{product.options?.map(option => option.name).join(", ")}</td></tr>}</> : <tr><th scope="row">Collection</th><td>New Arrival / Trending Products</td></tr>}</tbody></table>}
      {active === "Video" && (blueSilence ? <div className="pd-video"><iframe title="Blue Silence reference product video" src="https://www.youtube-nocookie.com/embed/GDSaJ4tpCRI" loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen /></div> : <p>No product video is available for this item.</p>)}
      </TabsContent>
    </Tabs>
  </section>
}
