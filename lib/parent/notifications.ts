import { ChildProfile, SMSDigestPayload, WhatsAppDigestCard } from "./types";

export function generateWhatsAppDigest(child: ChildProfile): WhatsAppDigestCard {
  const parentalTipNepali = `यो हप्ता आरभले गणित (VAT) धेरै राम्रोसँग बुझेका छन्। विज्ञानको 'आर्किमिडिज उर्ध्वचाप' मा थोरै थप अभ्यास गर्न हौसला दिनुहोला।`;
  const parentalTipEnglish = `Aarav performed brilliantly in 13% VAT calculations. Please encourage him to practice word problems on Archimedes Upthrust.`;

  const formattedWhatsAppText = `🇳🇵 *AI Learning Nepal — साप्ताहिक प्रगति विवरण (Weekly Progress Report)*
━━━━━━━━━━━━━━━━━━━━
👤 *विद्यार्थी (Student):* ${child.name} (${child.grade})
🏫 *विद्यालय (School):* ${child.schoolName}
📅 *हप्ता (Period):* २०८१ भाद्र पहिलो हप्ता (Week 1)

📊 *साप्ताहिक उपलब्धि (Weekly Highlights):*
⏱️ *अध्ययन समय (Study Time):* ${child.weeklyStudyHours} घण्टा (Hours)
🔥 *दैनिक निरन्तरता (Streak):* ${child.currentStreakDays} दिन लगातार (Days)
🎯 *समग्र सिकाई (Overall Mastery):* ${child.overallMasteryPercentage}%
🏅 *अनुमानित BLE GPA:* *${child.estimatedGpa.toFixed(2)} (Grade A)*

🌟 *सिकेका मुख्य विषयहरू (Mastered Concepts):*
${child.masteredTopicsThisWeek.map((t) => `  ✓ ${t}`).join("\n")}

💡 *अभिभावक सल्लाह (Parent Guidance Tip):*
${parentalTipNepali}

━━━━━━━━━━━━━━━━━━━━
🔗 थप विवरण हेर्नुहोस्: https://ailearning.edu.np/parent`;

  return {
    recipientPhoneNumber: "+977-9841234567",
    childName: child.name,
    weekRange: "2081 Bhadra Week 1",
    studyTimeHours: child.weeklyStudyHours,
    streakDays: child.currentStreakDays,
    estimatedGpa: child.estimatedGpa,
    masteredHighlights: child.masteredTopicsThisWeek,
    parentalTipNepali,
    parentalTipEnglish,
    formattedWhatsAppText,
  };
}

export function generateSMSDigest(child: ChildProfile): SMSDigestPayload {
  const messageNepali = `नमस्ते! ${child.nameNepali}ले यो हप्ता ${child.weeklyStudyHours} घण्टा पढी ${child.overallMasteryPercentage}% सिकाई पुरा गर्नुभएको छ। अनुमानित BLE GPA: ${child.estimatedGpa}। धन्यवाद! AI Learning Nepal`;
  const messageEnglish = `AI Nepal: ${child.name} studied ${child.weeklyStudyHours} hrs this week (${child.overallMasteryPercentage}% mastery). Est. BLE GPA: ${child.estimatedGpa}. Great job!`;

  return {
    recipientPhoneNumber: "+977-9841234567",
    smsGateway: "SPARROW_SMS",
    senderId: "AI-NEPAL",
    messageNepali,
    messageEnglish,
    charCountNepali: messageNepali.length,
    charCountEnglish: messageEnglish.length,
  };
}
