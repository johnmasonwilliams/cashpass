import chromium from 'chrome-aws-lambda'

export default async function handler(req: any, res: any) {
  const endpoint = req.query.endpoint as string

  if (!endpoint) {
    return res.status(400).send('Needs an endpoint')
  }

  console.log(endpoint)

  const data = await scrapeSite(endpoint)

  return res.status(200).send(data)
}

async function scrapeSite(endpoint: string) {
  console.log(`Scraping ${endpoint}...`)

  const browser = await chromium.puppeteer.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
    ],
  })
  const page = await browser.newPage()

  await page.goto(
    `https://www.cashbackmonitor.com/cashback-store/${endpoint}`,
    { waitUntil: 'domcontentloaded' }
  )

  // Set screen size
  await page.setViewport({ width: 1920, height: 1080 })

  const data = await page.evaluate(() => {
    let tables = []

    for (let i = 0; i < 2; i++) {
      const tbody = document.querySelector(
        `body > div:nth-child(9) > table > tbody > tr:nth-child(1) > td.sp.half.tl > div:nth-child(${
          i + 1
        }) > table > tbody`
      )

      if (!tbody) {
        continue
      }

      const trs = Array.from(tbody.querySelectorAll('tr'))

      const table = trs.map((tr) => {
        const cols = Array.from(tr.querySelectorAll('td'))
        const data = cols.map((col) => {
          return col.innerText.trim()
        })

        return {
          name: data[1],
          value: data[2],
        }
      })

      table.shift()

      tables.push(table)
    }

    for (let i = 0; i < 2; i++) {
      const tbody = document.querySelector(
        `body > div:nth-child(9) > table > tbody > tr:nth-child(1) >  td:nth-child(2) > div:nth-child(${
          i + 1
        }) > table > tbody`
      )

      if (!tbody) {
        continue
      }

      const trs = Array.from(tbody.querySelectorAll('tr'))

      const table = trs.map((tr) => {
        const cols = Array.from(tr.querySelectorAll('td'))
        const data = cols.map((col) => {
          return col.innerText.trim()
        })

        return {
          name: data[1],
          value: data[2],
        }
      })

      table.shift()

      tables.push(table)
    }

    return tables
  })

  await browser.close()

  console.log('Done scraping.')

  return data
}
