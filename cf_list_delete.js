import {
  deleteZeroTrustListsOneByOne,
  getZeroTrustLists,
} from "./lib/api.js";
import { DELETION_ENABLED, TIER_NAMES, getTierListPrefix } from "./lib/constants.js";
import { notifyWebhook } from "./lib/utils.js";

if (!DELETION_ENABLED) {
  console.warn(
    "The list deletion step is no longer needed to update filter lists, safely skipping. To proceed with deletion to e.g. stop using NOADS, set the environment variable NOADS_DELETION_ENABLED=true and re-run the script. Exiting."
  );
  process.exit(0);
}

(async () => {
  const { result: lists } = await getZeroTrustLists();

  if (!lists) {
    console.warn(
      "No file lists found - this is not an issue if it's your first time running this script. Exiting."
    );
    return;
  }

  // Match lists from all tiers + legacy "NOADS List" prefix
  const prefixes = [
    ...TIER_NAMES.map(getTierListPrefix),
    "NOADS List", // legacy prefix for backward compatibility
  ];

  const noadsLists = lists.filter(({ name }) =>
    prefixes.some((prefix) => name.startsWith(prefix))
  );

  if (!noadsLists.length) {
    console.warn(
      "No lists with matching name found - this is not an issue if you haven't created any filter lists before. Exiting."
    );
    return;
  }

  console.log(
    `Got ${lists.length} lists, ${noadsLists.length} of which are NOADS lists that will be deleted.`
  );

  console.log(`Deleting ${noadsLists.length} lists...`);

  await deleteZeroTrustListsOneByOne(noadsLists);
  await notifyWebhook(`CF List Delete script finished running (${noadsLists.length} lists)`);
})();
