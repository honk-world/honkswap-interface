import { ChainId } from '@mistswapdex/sdk'
const THE_GRAPH = 'http://127.0.0.1:8000';

export const GRAPH_HOST = {
  [ChainId.SMARTBCH]: THE_GRAPH,
  [ChainId.SMARTBCH_AMBER]: THE_GRAPH,
}
