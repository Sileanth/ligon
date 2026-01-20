import { type platform, type region, type apiResult, RiotApi } from './client.js';
import * as z from "zod";

const ObjectiveDtoSchema = z.object({
  first: z.boolean().optional(),
  kills: z.number().int().optional(),
})

const ObjectivesDtoSchema = z.object({
  baron: ObjectiveDtoSchema.optional(),
  champion: ObjectiveDtoSchema.optional(),
  dragon: ObjectiveDtoSchema.optional(),
  horde: ObjectiveDtoSchema.optional(),
  inhibitor: ObjectiveDtoSchema.optional(),
  riftHerald: ObjectiveDtoSchema.optional(),
  tower: ObjectiveDtoSchema.optional(),
});

const BanDtoSchema = z.object({
  championId: z.number().int(),
  pickTurn: z.number().int(),
});

const TeamDtoSchema = z.object({
  bans: z.array(BanDtoSchema).optional(),
  objectives: ObjectivesDtoSchema,
  teamId: z.number().int(),
  win: z.boolean(),
});

const PerkStyleSelectionDtoSchema = z.object({
  perk: z.number().int(),
  var1: z.number().int(),
  var2: z.number().int(),
  var3: z.number().int(),
});

const PerkStyleDtoSchema = z.object({
  description: z.string(),
  selections: z.array(PerkStyleSelectionDtoSchema),
  style: z.number().int(),
});

const PerkStatDtoSchema = z.object({
  defense: z.number().int(),
  flex: z.number().int(),
  offense: z.number().int(),
});

const PerksDtoScheme = z.object({
  statPerks: PerkStatDtoSchema,
  styles: z.array(PerkStyleDtoSchema),
});

const MisssionsDtoSchema = z.object({
  playerScore0: z.number().int().optional(),
  playerScore1: z.number().int().optional(),
  playerScore2: z.number().int().optional(),
  playerScore3: z.number().int().optional(),
  playerScore4: z.number().int().optional(),
  playerScore5: z.number().int().optional(),
  playerScore6: z.number().int().optional(),
  playerScore7: z.number().int().optional(),
  playerScore8: z.number().int().optional(),
  playerScore9: z.number().int().optional(),
  playerScore10: z.number().int().optional(),
  playerScore11: z.number().int().optional(),
});

const ChallengesDtoSchema = z.object({
  assistStreakCount: z.number(),
  baronBuffGoldAdvantageOverThreshold: z.number(),
  controlWardTimeCoverageInRiverOrEnemyHalf: z.number(),
  earliestBaron: z.number(),
  earliestDragonTakedown: z.number(),
  earliestElderDragon: z.number(),
  earlyLaningPhaseGoldExpAdvantage: z.number(),
  fasterSupportQuestCompletion: z.number(),
  fastestLegendary: z.number(),
  hadAfkTeammate: z.number(),
  highestChampionDamage: z.number(),
  highestCrowdControlScore: z.number(),
  highestWardKills: z.number(),
  junglerKillsEarlyJungle: z.number(),
  killsOnLanersEarlyJungleAsJungler: z.number(),
  laningPhaseGoldExpAdvantage: z.number(),
  legendaryCount: z.number(),
  maxCsAdvantageOnLaneOpponent: z.number(),
  maxLevelLeadLaneOpponent: z.number(),
  mostWardsDestroyedOneSweeper: z.number(),
  mythicItemUsed: z.number(),
  playedChampSelectPosition: z.number(),
  soloTurretsLategame: z.number(),
  takedownsFirst25Minutes: z.number(),
  teleportTakedowns: z.number(),
  thirdInhibitorDestroyedTime: z.number(),
  threeWardsOneSweeperCount: z.number(),
  visionScoreAdvantageLaneOpponent: z.number(),
  InfernalScalePickup: z.number(),
  fistBumpParticipation: z.number(),
  voidMonsterKill: z.number(),
  abilityUses: z.number(),
  acesBefore15Minutes: z.number(),
  alliedJungleMonsterKills: z.number(),
  baronTakedowns: z.number(),
  blastConeOppositeOpponentCount: z.number(),
  bountyGold: z.number(),
  buffsStolen: z.number(),
  completeSupportQuestInTime: z.number(),
  controlWardsPlaced: z.number(),
  damagePerMinute: z.number(),
  damageTakenOnTeamPercentage: z.number(),
  dancedWithRiftHerald: z.number(),
  deathsByEnemyChamps: z.number(),
  dodgeSkillShotsSmallWindow: z.number(),
  doubleAces: z.number(),
  dragonTakedowns: z.number(),
  legendaryItemUsed: z.array(z.number()),
  effectiveHealAndShielding: z.number(),
  elderDragonKillsWithOpposingSoul: z.number(),
  elderDragonMultikills: z.number(),
  enemyChampionImmobilizations: z.number(),
  enemyJungleMonsterKills: z.number(),
  epicMonsterKillsNearEnemyJungler: z.number(),
  epicMonsterKillsWithin30SecondsOfSpawn: z.number(),
  epicMonsterSteals: z.number(),
  epicMonsterStolenWithoutSmite: z.number(),
  firstTurretKilled: z.number(),
  firstTurretKilledTime: z.number(),
  flawlessAces: z.number(),
  fullTeamTakedown: z.number(),
  gameLength: z.number(),
  getTakedownsInAllLanesEarlyJungleAsLaner: z.number(),
  goldPerMinute: z.number(),
  hadOpenNexus: z.number(),
  immobilizeAndKillWithAlly: z.number(),
  initialBuffCount: z.number(),
  initialCrabCount: z.number(),
  jungleCsBefore10Minutes: z.number(),
  junglerTakedownsNearDamagedEpicMonster: z.number(),
  kda: z.number(),
  killAfterHiddenWithAlly: z.number(),
  killedChampTookFullTeamDamageSurvived: z.number(),
  killingSprees: z.number(),
  killParticipation: z.number(),
  killsNearEnemyTurret: z.number(),
  killsOnOtherLanesEarlyJungleAsLaner: z.number(),
  killsOnRecentlyHealedByAramPack: z.number(),
  killsUnderOwnTurret: z.number(),
  killsWithHelpFromEpicMonster: z.number(),
  knockEnemyIntoTeamAndKill: z.number(),
  kTurretsDestroyedBeforePlatesFall: z.number(),
  landSkillShotsEarlyGame: z.number(),
  laneMinionsFirst10Minutes: z.number(),
  lostAnInhibitor: z.number(),
  maxKillDeficit: z.number(),
  mejaisFullStackInTime: z.number(),
  moreEnemyJungleThanOpponent: z.number(),
  multiKillOneSpell: z.number(),
  multikills: z.number(),
  multikillsAfterAggressiveFlash: z.number(),
  multiTurretRiftHeraldCount: z.number(),
  outerTurretExecutesBefore10Minutes: z.number(),
  outnumberedKills: z.number(),
  outnumberedNexusKill: z.number(),
  perfectDragonSoulsTaken: z.number(),
  perfectGame: z.number(),
  pickKillWithAlly: z.number(),
  poroExplosions: z.number(),
  quickCleanse: z.number(),
  quickFirstTurret: z.number(),
  quickSoloKills: z.number(),
  riftHeraldTakedowns: z.number(),
  saveAllyFromDeath: z.number(),
  scuttleCrabKills: z.number(),
  shortestTimeToAceFromFirstTakedown: z.number(),
  skillshotsDodged: z.number(),
  skillshotsHit: z.number(),
  snowballsHit: z.number(),
  soloBaronKills: z.number(),
  soloKills: z.number(),
  stealthWardsPlaced: z.number(),
  survivedSingleDigitHpCount: z.number(),
  survivedThreeImmobilizesInFight: z.number(),
  takedownOnFirstTurret: z.number(),
  takedowns: z.number(),
  takedownsAfterGainingLevelAdvantage: z.number(),
  takedownsBeforeJungleMinionSpawn: z.number(),
  takedownsFirstXMinutes: z.number(),
  takedownsInAlcove: z.number(),
  takedownsInEnemyFountain: z.number(),
  teamBaronKills: z.number(),
  teamDamagePercentage: z.number(),
  teamElderDragonKills: z.number(),
  teamRiftHeraldKills: z.number(),
  tookLargeDamageSurvived: z.number(),
  turretPlatesTaken: z.number(),
  turretsTakenWithRiftHerald: z.number(),
  turretTakedowns: z.number(),
  twentyMinionsIn3SecondsCount: z.number(),
  twoWardsOneSweeperCount: z.number(),
  unseenRecalls: z.number(),
  visionScorePerMinute: z.number(),
  wardsGuarded: z.number(),
  wardTakedowns: z.number(),
  wardTakedownsBefore20M: z.number(),

  // SWARM Specific Stats
  SWARM_DefeatAatrox: z.number(),
  SWARM_DefeatBriar: z.number(),
  SWARM_DefeatMiniBosses: z.number(),
  SWARM_EvolveWeapon: z.number(),
  SWARM_Have3Passives: z.number(),
  SWARM_KillEnemy: z.number(),
  SWARM_PickupGold: z.number(),
  SWARM_ReachLevel50: z.number(),
  SWARM_Survive15Min: z.number(),
  SWARM_WinWith5EvolvedWeapons: z.number(),
})
  .partial()
  .loose(); // it can change ery dynamicly, so we don't want to break the whole parser



export const participantDtoSchema = z.object({
  // Pings
  allInPings: z.number().default(0),
  assistMePings: z.number().default(0),
  commandPings: z.number().default(0),
  enemyMissingPings: z.number().default(0),
  enemyVisionPings: z.number().default(0),
  getBackPings: z.number().default(0),
  holdPings: z.number().default(0),
  needVisionPings: z.number().default(0),
  onMyWayPings: z.number().default(0),
  pushPings: z.number().default(0),
  visionClearedPings: z.number().default(0),
  // Combat & KDA
  assists: z.number().default(0),
  deaths: z.number().default(0),
  kills: z.number().default(0),
  doubleKills: z.number().default(0),
  tripleKills: z.number().default(0),
  quadraKills: z.number().default(0),
  pentaKills: z.number().default(0),
  unrealKills: z.number().default(0),
  killingSprees: z.number().default(0),
  largestKillingSpree: z.number().default(0),
  largestMultiKill: z.number().default(0),
  bountyLevel: z.number().default(0),
  firstBloodAssist: z.boolean().default(false),
  firstBloodKill: z.boolean().default(false),

  // Damage
  damageDealtToBuildings: z.number().default(0),
  damageDealtToObjectives: z.number().default(0),
  damageDealtToTurrets: z.number().default(0),
  damageSelfMitigated: z.number().default(0),
  magicDamageDealt: z.number().default(0),
  magicDamageDealtToChampions: z.number().default(0),
  magicDamageTaken: z.number().default(0),
  physicalDamageDealt: z.number().default(0),
  physicalDamageDealtToChampions: z.number().default(0),
  physicalDamageTaken: z.number().default(0),
  totalDamageDealt: z.number().default(0),
  totalDamageDealtToChampions: z.number().default(0),
  totalDamageShieldedOnTeammates: z.number().default(0),
  totalDamageTaken: z.number().default(0),
  trueDamageDealt: z.number().default(0),
  trueDamageDealtToChampions: z.number().default(0),
  trueDamageTaken: z.number().default(0),
  largestCriticalStrike: z.number().default(0),

  // Champion & Leveling
  championId: z.number(),
  championName: z.string(),
  championTransform: z.number(),
  champExperience: z.number(),
  champLevel: z.number(),
  individualPosition: z.string(),
  teamPosition: z.string(),
  lane: z.string(),
  role: z.string(),
  participantId: z.number(),

  // Items & Economy
  goldEarned: z.number().default(0),
  goldSpent: z.number().default(0),
  consumablesPurchased: z.number().default(0),
  itemsPurchased: z.number().default(0),
  item0: z.number().optional(),
  item1: z.number().optional(),
  item2: z.number().optional(),
  item3: z.number().optional(),
  item4: z.number().optional(),
  item5: z.number().optional(),
  item6: z.number().optional(),

  // Objectives & Vision
  baronKills: z.number().default(0),
  dragonKills: z.number().default(0),
  inhibitorKills: z.number().default(0),
  inhibitorTakedowns: z.number().default(0),
  inhibitorsLost: z.number().default(0),
  nexusKills: z.number().default(0),
  nexusTakedowns: z.number().default(0),
  nexusLost: z.number().default(0),
  objectivesStolen: z.number().default(0),
  objectivesStolenAssists: z.number().default(0),
  turretKills: z.number().default(0),
  turretTakedowns: z.number().default(0),
  turretsLost: z.number().default(0),
  firstTowerAssist: z.boolean().default(false),
  firstTowerKill: z.boolean().default(false),
  detectorWardsPlaced: z.number().default(0),
  sightWardsBoughtInGame: z.number().default(0),
  visionWardsBoughtInGame: z.number().default(0),
  wardsKilled: z.number().default(0),
  wardsPlaced: z.number().default(0),
  visionScore: z.number().default(0),

  // Healing & Utility
  totalHeal: z.number().default(0),
  totalHealsOnTeammates: z.number().default(0),
  totalUnitsHealed: z.number().default(0),
  timeCCingOthers: z.number().default(0),
  totalTimeCCDealt: z.number().default(0),

  // Minions & Jungle
  neutralMinionsKilled: z.number().default(0),
  totalAllyJungleMinionsKilled: z.number().default(0),
  totalEnemyJungleMinionsKilled: z.number().default(0),
  totalMinionsKilled: z.number().default(0),

  // Game State & Performance
  win: z.boolean(),
  gameEndedInEarlySurrender: z.boolean(),
  gameEndedInSurrender: z.boolean(),
  teamEarlySurrendered: z.boolean(),
  eligibleForProgression: z.boolean(),
  timePlayed: z.number(),
  totalTimeSpentDead: z.number(),
  longestTimeSpentLiving: z.number(),
  summonerId: z.string(),
  summonerLevel: z.number(),
  summonerName: z.string(),
  puuid: z.string(),
  riotIdGameName: z.string(),
  riotIdTagline: z.string(),
  profileIcon: z.number(),
  teamId: z.number(),

  // Casts
  spell1Casts: z.number().default(0),
  spell2Casts: z.number().default(0),
  spell3Casts: z.number().default(0),
  spell4Casts: z.number().default(0),
  summoner1Casts: z.number().default(0),
  summoner1Id: z.number(),
  summoner2Casts: z.number().default(0),
  summoner2Id: z.number(),

  // Arena Specific / Others
  placement: z.number().optional(),
  subteamPlacement: z.number().optional(),
  playerSubteamId: z.number().optional(),
  playerAugment1: z.number().optional(),
  playerAugment2: z.number().optional(),
  playerAugment3: z.number().optional(),
  playerAugment4: z.number().optional(),

  // Scores
  playerScore0: z.number(),
  playerScore1: z.number(),
  playerScore2: z.number(),
  playerScore3: z.number(),
  playerScore4: z.number(),
  playerScore5: z.number(),
  playerScore6: z.number(),
  playerScore7: z.number(),
  playerScore8: z.number(),
  playerScore9: z.number(),
  playerScore10: z.number(),
  playerScore11: z.number(),

  // Nested Objects
  challenges: ChallengesDtoSchema,
  perks: PerksDtoScheme,
  missions: MisssionsDtoSchema,
})
  .partial()
  .loose();

const MetadataDtoSchema = z.object({
  dataVersion: z.string(),
  matchId: z.union([z.string(), z.number()]).transform((val) => val.toString()),
  participants: z.array(z.string()),
});
const InfoDtoSchema = z.object({
  gameCreation: z.number(),
  gameDuration: z.number(),
  gameEndTimestamp: z.number().optional(),
  gameId: z.number(),
  gameMode: z.string(),
  gameName: z.string().optional(),
  gameStartTimestamp: z.number(),
  gameType: z.string(),
  gameVersion: z.string(),
  mapId: z.number().int(),
  participants: z.array(participantDtoSchema),
  platformId: z.string(),
  queueId: z.number().int(),
  tournamentCode: z.string().optional(),
  endOfGameResult: z.string().optional(),
  teams: z.array(TeamDtoSchema),
});


export const MatchDtoSchema = z.object({
  metadata: MetadataDtoSchema,
  info: InfoDtoSchema,
});

export type MatchDto = z.infer<typeof MatchDtoSchema>;

export async function getMatchById(matchId: string, riotApi: RiotApi, region?: region) {
  if (!region) {
    region = 'europe';
  }

  let data = await riotApi.makeRequest(`/lol/match/v5/matches/${matchId}`, region);

  if (data.result === 'notFound') {
    return undefined;
  }

  if (data.result !== 'success') {
    throw new Error(`Match API error [${matchId}]: ${data.data?.status?.message || 'Unknown error'}`);
  }

  const parsed = MatchDtoSchema.safeParse(data.data);
  if (!parsed.success) {
    let err = z.treeifyError(parsed.error);
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    console.error(`Match data format mismatch for ID: ${matchId}`);
    console.error(err);
    throw new Error(`Match data format mismatch for ID: ${matchId}`);
  }

  return parsed.data;
}