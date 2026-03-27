import { deleteZeroTrustRule, getZeroTrustRules } from "./lib/api.js";
import { DELETION_ENABLED } from "./lib/constants.js";
import { notifyWebhook } from "./lib/utils.js";

if (!DELETION_ENABLED) {
  console.warn(
    "The rule deletion step is no longer needed to update filter lists, safely skipping. To proceed with deletion to e.g. stop using NOADS, set the environment variable NOADS_DELETION_ENABLED=true and re-run the script. Exiting."
  );
  process.exit(0);
}

const { result: rules } = await getZeroTrustRules();
// Match all tier-based rules + legacy rules
const noadsRules = rules.filter(({ name }) => name.startsWith("NOADS Filter"));

(async () => {
  if (!noadsRules.length) {
    console.warn(
      "No rule(s) with matching name found - this is not an issue if you haven't run the create script yet. Exiting."
    );
    return;
  }

  for (const noadsRule of noadsRules) {
    console.log(`Deleting rule ${noadsRule.name}...`);
    await deleteZeroTrustRule(noadsRule.id);
  }
})();

// Send a notification to the webhook
await notifyWebhook("CF Gateway Rule Delete script finished running");
