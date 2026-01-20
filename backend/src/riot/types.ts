
export type queue_types = "ranked" | "normal" | "tourney" | "tutorial"

export const soloq = "RANKED_SOLO_5x5"
export const flex = "RANKED_FLEX_5x5"
export type leage_queues = typeof soloq | typeof flex

export const soloq_id = 420
export type queues_ids = typeof soloq_id
