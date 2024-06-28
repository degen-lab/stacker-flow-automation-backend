import { fetchPoxInfo } from './api-calls';
import { getEvents, getRewardIndexesMap, parseEvents } from './helpers';

const main = async () => {
  try {
    const poxInfo = await fetchPoxInfo();

    if (poxInfo === null) {
      return;
    }

    const currentCycle = poxInfo.current_cycle.id;

    console.log('Current cycle:', currentCycle);
    console.log(
      "Next cycle's prepare phase starts in",
      poxInfo.next_cycle.blocks_until_prepare_phase,
      'blocks.'
    );

    const events = await getEvents();

    events.reverse();

    const rewardIndexesMap = await getRewardIndexesMap();
    const {
      delegations,
      acceptedDelegations,
      committedDelegations,
      previousDelegations,
    } = await parseEvents(events, rewardIndexesMap);

    console.log('Delegations:', delegations);
    console.log('Accepted Delegations:', acceptedDelegations);
    console.log('Committed Delegations:', committedDelegations);
    console.log('Previous Delegations:', previousDelegations);
  } catch (error) {
    console.error('Error:', error);
  }
};

main();
