import { request } from 'graphql-request'
import useSWR from 'swr'

//todo: this is mistbar
const QUERY = `{
    bar(id: "0xc41c680c60309d4646379ed62020c534eb67b6f4") {  
      ratio
    }
}`

const fetcher = (query) => request('https://thegraph.honkswap.fi/subgraphs/name/honkswap/bar', query)

// Returns ratio of XSushi:Sushi
export default function useSushiPerXSushi(parse = true) {
  const { data } = useSWR(QUERY, fetcher)
  return parse ? parseFloat(data?.bar?.ratio) : data?.bar?.ratio
}
