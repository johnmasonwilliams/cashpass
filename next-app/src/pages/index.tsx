import Meta from '@/pages/components/Meta'
import { FormEvent, useState } from 'react'

interface FormElements extends HTMLFormControlsCollection {
  endpoint: HTMLInputElement
}

interface CashbackFormElements extends HTMLFormElement {
  readonly elements: FormElements
}

const HomePage = () => {
  const [data, setData] = useState<{ name: string; value: string }[]>()

  const handleSubmit = async (e: FormEvent<CashbackFormElements>) => {
    e.preventDefault()

    const endpoint = e.currentTarget.elements.endpoint.value

    const res = await fetch(
      `http://localhost:3200/scraper?endpoint=${endpoint}`
    )

    const data = await res.json()

    setData(data)
  }

  return (
    <>
      <Meta />

      <form onSubmit={handleSubmit}>
        <input
          type={'text'}
          name={'endpoint'}
          placeholder={'Search'}
          className={'bg-gray-300'}
        />

        <button type={'submit'} className={'bg-blue-600 text-white px-5'}>
          Search
        </button>
      </form>

      {data && (
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
            {data.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default HomePage
