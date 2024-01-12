import { Hono } from 'hono'
import { createRenderer } from './renderer'
import { css } from 'hono/css'
import { Link } from './renderer'
import { FC } from 'hono/jsx'
import { Suspense } from 'hono/jsx/streaming'

const BASE_URL = 'https://ramen-api.dev'

type Phono = {
  name: string
  width: number
  height: number
  authorId: string
  url: string
}

type Shop = {
  id: string
  name: string
  photos: Phono[]
}

const app = new Hono()

app.get('*', async (c, next) => createRenderer(c)(c, next))

app.get('/', (c) => {
  return c.render(
    <div>
      <h1>こんにちわ！</h1>
      <button hx-post="/clicked" hx-trigger="click">
        クリックして
      </button>
    </div>
  )
})

app.post('/clicked', (c) => {
  return c.html(<>やあ</>)
})

app.get('/about', (c) => {
  return c.render(
    <div>
      <h1>これはなに？</h1>
      <p>ラーメン屋を紹介するよ</p>
    </div>
  )
})

let shopsList: Shop[] | undefined = undefined

const ShopsListComponent = async () => {
  if (!shopsList) {
    const res = await fetch(new URL('/shops', BASE_URL))
    const data = (await res.json()) as { shops: Shop[] }
    shopsList = data.shops
  }
  return (
    <div>
      <h1>ラーメン屋</h1>
      <ul>
        {shopsList.map((shop) => {
          return (
            <li>
              <Link href={`/shops/${shop.id}`}>{shop.name}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

app.get('/shops', async (c) => {
  return c.render(<ShopsListComponent />)
})

const shopInfo: Record<string, Shop | undefined> = {}

const ShopComponent: FC<{ shopId: string }> = async ({ shopId }) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  let shop = shopInfo[shopId]
  if (!shop) {
    const res = await fetch(new URL(`/shops/${shopId}`, BASE_URL))
    const data = (await res.json()) as { shop: Shop }
    shop = data.shop
    shopInfo[shopId] = shop
  }
  const className = css`
    padding: 2px;
    border: 1px solid #999;
  `
  return (
    <div>
      <h1>{shop.name}</h1>
      {shop.photos.map((photo) => {
        return (
          <div>
            <p>
              <img class={className} src={photo.url} width={photo.width / 4} height={photo.height / 4} loading="lazy" />
            </p>
            <p>
              Photo by <span>{photo.authorId}</span>
            </p>
          </div>
        )
      })}
    </div>
  )
}

app.get('/shops/:shopId', async (c) => {
  const { shopId } = c.req.param()
  let shop = shopInfo[shopId]
  if (!shop) {
    const res = await fetch(new URL(`/shops/${shopId}`, BASE_URL))
    const data = (await res.json()) as { shop: Shop }
    shop = data.shop
    shopInfo[shopId] = shop
  }
  const className = css`
    padding: 2px;
    border: 1px solid #999;
  `
  return c.render(
    <Suspense fallback={'loading...'}>
      <ShopComponent shopId={shopId} />
    </Suspense>
  )
})

export default app
