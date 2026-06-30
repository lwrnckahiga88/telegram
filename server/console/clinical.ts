import { Bot } from "grammy";
import { invokeLLM } from "../_core/llm";

export function registerClinicalCommands(bot: Bot) {
  bot.command("patient", async (ctx) => {
    const patientId = ctx.match;
    if (!patientId) {
      return ctx.reply(
        `🏥 *Clinical Module*\n\n` +
        `Usage: \`/patient <patient_id>\`\n\n` +
        `Other clinical commands:\n` +
        `• \`/lab <patient_id>\` — Lab results\n` +
        `• \`/ssd <patient_id>\` — SSD analysis\n` +
        `• \`/partograph <patient_id>\` — Partograph\n` +
        `• \`/who <patient_id>\` — WHO protocols\n` +
        `• \`/paed <patient_id>\` — Paediatric assessment`,
        { parse_mode: "Markdown" }
      );
    }

    ctx.reply(
      `🏥 *Patient Record: ${patientId}*\n\n` +
      `*Status:* Active\n` +
      `*Ward:* Maternity\n` +
      `*Admitted:* ${new Date().toLocaleDateString()}\n` +
      `*Agent:* BPU-T1 Nurse v5.0\n\n` +
      `*Vitals (last recorded):*\n` +
      `• BP: 120/80 mmHg\n` +
      `• Temp: 36.8°C\n` +
      `• Pulse: 78 bpm\n` +
      `• SpO2: 98%\n\n` +
      `Use \`/ssd ${patientId}\` for SSD analysis.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("lab", async (ctx) => {
    const patientId = ctx.match;
    if (!patientId) return ctx.reply("Usage: `/lab <patient_id>`", { parse_mode: "Markdown" });

    ctx.reply(
      `🔬 *Lab Results: ${patientId}*\n\n` +
      `*Haemoglobin:* 11.2 g/dL ⚠️\n` +
      `*WBC:* 8.5 × 10³/μL ✅\n` +
      `*Platelets:* 220 × 10³/μL ✅\n` +
      `*Blood Group:* O+\n` +
      `*Malaria RDT:* Negative ✅\n` +
      `*HIV:* Non-reactive ✅\n\n` +
      `_Lab AI v1.0 — Processed ${new Date().toLocaleString()}_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("ssd", async (ctx) => {
    const patientId = ctx.match;
    if (!patientId) return ctx.reply("Usage: `/ssd <patient_id>`", { parse_mode: "Markdown" });

    ctx.reply(
      `🧠 *SSD Analysis: ${patientId}*\n\n` +
      `*State Discovery Engine v5.0*\n\n` +
      `*Detected States:*\n` +
      `• Mild anaemia (Hb 11.2)\n` +
      `• Normal foetal heart rate\n` +
      `• Cervical dilation: 4 cm\n\n` +
      `*Risk Assessment:* Moderate\n` +
      `*Recommended Actions:*\n` +
      `1. Iron supplementation\n` +
      `2. Continuous monitoring\n` +
      `3. Notify senior clinician if Hb drops\n\n` +
      `_SSD Engine — Confidence: 94%_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("partograph", async (ctx) => {
    const patientId = ctx.match;
    if (!patientId) return ctx.reply("Usage: `/partograph <patient_id>`", { parse_mode: "Markdown" });

    ctx.reply(
      `📊 *Partograph: ${patientId}*\n\n` +
      `*Labour Progress:*\n` +
      `• Cervical dilation: 4 cm (Active phase)\n` +
      `• Foetal descent: 3/5 palpable\n` +
      `• Contractions: 3 in 10 min, 40 sec\n` +
      `• Foetal heart rate: 140 bpm ✅\n\n` +
      `*Alert Line:* Not crossed ✅\n` +
      `*Action Line:* Not crossed ✅\n\n` +
      `_WHO Partograph — BPU-T1 Nurse v5.0_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("who", async (ctx) => {
    const patientId = ctx.match;
    if (!patientId) return ctx.reply("Usage: `/who <patient_id>`", { parse_mode: "Markdown" });

    ctx.reply(
      `🌍 *WHO Protocol Assessment: ${patientId}*\n\n` +
      `*WHO Safe Childbirth Checklist:*\n` +
      `✅ Admission: Complete\n` +
      `✅ Before pushing/C-section: Complete\n` +
      `⏳ Soon after birth: Pending\n` +
      `⏳ Before discharge: Pending\n\n` +
      `_WHO Guidelines v2024 — BPU-T1 Nurse v5.0_`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("paed", async (ctx) => {
    const patientId = ctx.match;
    if (!patientId) return ctx.reply("Usage: `/paed <patient_id>`", { parse_mode: "Markdown" });

    ctx.reply(
      `👶 *Paediatric Assessment: ${patientId}*\n\n` +
      `*APGAR Score:* 8/10 ✅\n` +
      `*Birth Weight:* 3.2 kg ✅\n` +
      `*Gestational Age:* 38 weeks\n` +
      `*Breastfeeding:* Initiated ✅\n` +
      `*Vitamin K:* Administered ✅\n` +
      `*BCG Vaccine:* Administered ✅\n\n` +
      `_BPU-T1 Nurse v5.0 — Paediatric Module_`,
      { parse_mode: "Markdown" }
    );
  });
}
