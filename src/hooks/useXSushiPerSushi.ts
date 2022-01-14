import { request } from 'graphql-request'
import useSWR from 'swr'

//todo: update with honkbar
const QUERY = `{
    bar(id: "0xdB9efDae281BCFF410d64FEB62D8f27D907745E3") {  
      ratio
    }
}`

const fetcher = (query) => request('https://thegraph.honkswap.fi/subgraphs/name/honkswap/bar', query)

// Returns ratio of XSushi:Sushi
export default function useSushiPerXSushi(parse = true) {
  const { data } = useSWR(QUERY, fetcher)
  return parse ? parseFloat(data?.bar?.ratio) : data?.bar?.ratio
}
