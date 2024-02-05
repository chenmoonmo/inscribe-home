
export type TickInfoType = {
  protocol: string;
  tick: string;
  price: string;
  volume_24: string;
  market_cap: string;
  total_supply: string;
  holders: number;
  minter: string;
};

export type OrderType = {
    protocol: string;
    tick: string;
    user: string;
    order_id: number;
    sell_amount: string;
    recv_amount: string;
    price: string;
    status: number;
    dead_line: number;
}