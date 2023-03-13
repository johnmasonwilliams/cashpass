import { FormEvent, useState } from 'react'
import Meta from './components/Meta'
import Spinner from '@/pages/components/Spinner'

interface FormElements extends HTMLFormControlsCollection {
  endpoint: HTMLInputElement
}

interface CashbackFormElements extends HTMLFormElement {
  readonly elements: FormElements
}

const apiURL =
  process.env.NODE_ENV === 'production'
    ? 'https://cashpass.vercel.app'
    : 'http://localhost:3000'

const tableTitles = [
  'Cashback',
  'Travel Miles/Points',
  'Credit Card Points',
  'Misc. Reward Points',
]

const HomePage = () => {
  const [data, setData] = useState<{ name: string; value: string }[][] | null>()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<CashbackFormElements>) => {
    e.preventDefault()

    setData(null)
    setIsLoading(true)

    const endpoint = e.currentTarget.elements.endpoint.value

    const res = await fetch(`${apiURL}/api/scraper?endpoint=${endpoint}`)

    if (res.status !== 200) {
      setIsLoading(false)
    }

    const data = await res.json()

    setIsLoading(false)
    setData(data)
  }

  return (
    <>
      <Meta />

      <div className={'m-5'}>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type={'text'}
              name={'endpoint'}
              placeholder={'Search'}
              className={'bg-gray-200 p-2'}
            />

            <button
              type={'submit'}
              className={'bg-blue-600 text-white py-2 px-3 hover:bg-blue-500'}
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : <span>Submit</span>}
            </button>
          </div>
        </form>
      </div>

      {data &&
        data.map((table, i) => (
          <>
            <h2>
              <b>{tableTitles[i]}</b>
            </h2>

            <table
              key={`table_${i}`}
              className={
                'table-fixed border-collapse border border-slate-500 m-5'
              }
            >
              <tbody>
                <tr>
                  <th className={'border border-slate-600'}>Provider</th>
                  <th className={'border border-slate-600'}>Rate</th>
                </tr>
                {table.map((row, j) => (
                  <tr key={`table_${i}-row_${j}`}>
                    <td className={'border border-slate-700'}>{row.name}</td>
                    <td className={'border border-slate-700'}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ))}
    </>
  )
}

export default HomePage
