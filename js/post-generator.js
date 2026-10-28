/**
 * Chittagong Tutor Service (CTS) - Tuition Post Generator
 * Generates professional tuition advertisements from tuition request data.
 * Supports:
 * - Emoji (Social Media / Facebook Groups / WhatsApp Broadcast)
 * - Plain Text (Formal / SMS / Official Notice)
 * - Automatic Privacy Protection: Strictly masks guardian identity, contact number & private address.
 * - Customizable media fee policy disclaimer and application links.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CTSPostGenerator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Generates formatted advertisement text
   * @param {Object} req - Tuition request record
   * @param {Object} options - Configuration options
   */
  function generatePost(req, options = {}) {
    if (!req) return '';

    const useEmoji = options.useEmoji !== undefined ? options.useEmoji : true;
    const includePolicy = options.includePolicy !== undefined ? options.includePolicy : true;
    const includeHotline = options.includeHotline !== undefined ? options.includeHotline : true;
    const businessName = options.businessName || 'Chittagong Tutor Service (CTS)';
    const hotline = options.hotline || '+880 1800-000000';
    const mediaFeePercent = options.mediaFeePercent || 50;

    const code = req.id || 'CTS-REQ-XXXX';
    const area = req.area || 'Chittagong';
    const city = req.city || 'Chittagong';
    const classLevel = req.classLevel || 'Not Specified';
    const curriculum = req.curriculum || 'Bangla Medium';
    const subjects = Array.isArray(req.subjects) ? req.subjects.join(', ') : (req.subjects || 'All Subjects');
    const days = req.daysPerWeek ? `${req.daysPerWeek} days/week` : 'Negotiable';
    const time = req.preferredTime || 'Evening (Negotiable)';
    const salary = req.salaryBudget ? `৳${parseFloat(req.salaryBudget).toLocaleString()} BDT` : 'Negotiable';
    const tutorPref = req.preferredTutorGender && req.preferredTutorGender !== 'Any'
      ? `${req.preferredTutorGender} Tutor Preferred`
      : 'Any Qualified Male/Female Tutor';
    const uniPref = req.preferredTutorUniversity ? ` (${req.preferredTutorUniversity})` : '';
    const type = req.tuitionType || 'Home Tutoring';

    const mediaPolicyText = includePolicy
      ? `CTS Standard Media Fee: ${mediaFeePercent}% of first month remuneration upon successful placement.`
      : '';

    if (useEmoji) {
      // Engaging Social Media Format
      return `📢 [CTS TUITION ALERT | CODE: ${code}]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Location: ${area}, ${city}
🎓 Class / Level: ${classLevel}
📖 Curriculum: ${curriculum}
📚 Subject(s): ${subjects}
📅 Frequency: ${days}
⏰ Preferred Shift: ${time}
💰 Remuneration: ${salary}
👤 Tutor Preference: ${tutorPref}${uniPref}
🎯 Tutoring Mode: ${type}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${includePolicy ? `💼 Policy: ${mediaPolicyText}\n` : ''}${includeHotline ? `📞 Apply / Inquire on WhatsApp: ${hotline}\n` : ''}📌 Verified Tuition by ${businessName}
🔒 Note: Tuition Code ${code} must be quoted when applying.`;
    } else {
      // Plain Text Formal Format
      return `[TUITION REQUIREMENT NOTICE - ${businessName}]
--------------------------------------------------
Tuition Code: ${code}
Location: ${area}, ${city}
Class / Level: ${classLevel} (${curriculum})
Subjects: ${subjects}
Schedule: ${days} | Time: ${time}
Remuneration: ${salary}
Tutor Preference: ${tutorPref}${uniPref}
Tutoring Mode: ${type}
--------------------------------------------------
${includePolicy ? `CTS Media Fee Policy: ${mediaPolicyText}\n` : ''}${includeHotline ? `Inquiry / Applications: ${hotline}\n` : ''}Security & Verification: Managed by ${businessName}
Please refer to Reference Code ${code}.`;
    }
  }

  /**
   * Helper to copy text to clipboard with modern API and fallback
   */
  async function copyToClipboard(text) {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard writeText failed, trying fallback', err);
      }
    }
    // Fallback using textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    } catch (err) {
      console.error('Fallback copy failed', err);
      textArea.remove();
      return false;
    }
  }

  return {
    generatePost,
    copyToClipboard
  };
});
