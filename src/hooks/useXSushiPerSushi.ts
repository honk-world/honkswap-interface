import { request } from 'graphql-request'
import useSWR from 'swr'

//todo: update with honkbar done
const QUERY = `{
    bar(id: "0xbE30834C394a8db13F38487d4A71f6AC26859b05") {  
      ratio
    }
}`

const fetcher = (query) => request('https://thegraph.honkswap.fi/subgraphs/name/honkswap/bar', query)

// Returns ratio of XSushi:Sushi
export default function useSushiPerXSushi(parse = true) {
  const { data } = useSWR(QUERY, fetcher)
  return parse ? parseFloat(data?.bar?.ratio) : data?.bar?.ratio
}
