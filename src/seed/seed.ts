import { Player } from '../coupon-redeem/entities/Player';
import { Reward } from '../coupon-redeem/entities/Reward';
import { players as playersList } from './data/players';
import { rewards as rewardsList } from './data/rewards';
import { connectionSource } from '../typeorm';

(async function seed() {
  connectionSource
    .initialize()
    .then(async (dataSource) => {
      const playerRepository = dataSource.getRepository(Player);

      const players = playerRepository.create(playersList);
      const oldPlayers = await playerRepository.find();
      await playerRepository.remove(oldPlayers);
      await playerRepository.save(players);

      const rewardsRepository = dataSource.getRepository(Reward);
      const rewards = rewardsRepository.create(rewardsList);
      const oldRewards = await rewardsRepository.find();
      await rewardsRepository.remove(oldRewards);
      await rewardsRepository.save(rewards);

      process.exit(0);
    })
    .catch((error) => console.log(error));
})();
