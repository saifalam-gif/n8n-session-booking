// 1) Teammates to notify
const NOTIFY_RECIPIENTS = [
  'saif.alam@nextventures.io',
  'api@wearenext.io',
  'api@nextventures.io',
  'aminul.islam@nextventures.io',
  'fahim@nextventures.io'
  // 'teammate2@company.com',
  // add more...
];

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    const formType = data.formType || 'session'; // Default to 'session' for backward compatibility

    if (formType === 'automation') {
      handleAutomationRequest(ss, data);
    } else {
      handleSessionRequest(ss, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle Session Request Form
function handleSessionRequest(ss, data) {
  const sheet = ss.getSheetByName('Sheet1'); // Change if your tab name is different
  
  // Column headers (auto-created once)
  const headers = [
    'timestamp',
    'department',
    'pocName',
    'pocEmail',
    'pocRole',
    'participants',
    'audienceProfile',
    'priorExposure',
    'sessionLevel',
    'sessionType',
    'primaryGoal',
    'walkaway',
    'automationFocus',
    'teamSuggestedDescription',
    'existingWorkflow',
    'tools',
    'credentialsReady',
    'sessionFormat',
    'sessionDuration',
    'dateFrom',
    'dateTo',
    'timeCritical',
    'learningOrImplementation',
    'constraints',
    'successDefinition',
    'followUp',
    'recordingPermission',
    'autoCalendar',
    'limitSessions',
    'preSessionChecklist',
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  // Append row
  const row = [
    new Date(),
    data.department,
    data.pocName,
    data.pocEmail,
    data.pocRole,
    data.participants,
    JSON.stringify(data.audienceProfile || []),
    data.priorExposure,
    data.sessionLevel,
    JSON.stringify(data.sessionType || []),
    data.primaryGoal,
    JSON.stringify(data.walkaway || []),
    data.automationFocus,
    data.teamSuggestedDescription || '',
    data.existingWorkflow || '',
    JSON.stringify(data.tools || []),
    data.credentialsReady,
    data.sessionFormat,
    data.sessionDuration,
    data.dateFrom || '',
    data.dateTo || '',
    data.timeCritical,
    data.learningOrImplementation,
    data.constraints || '',
    data.successDefinition,
    data.followUp,
    data.recordingPermission,
    data.autoCalendar || '',
    data.limitSessions || '',
    data.preSessionChecklist || ''
  ];

  sheet.appendRow(row);

  // Send notification email
  const subject = `New n8n session request – ${data.department || 'Unknown department'}`;

  const body =
    'A new n8n session request has been submitted.\n\n' +
    `Department: ${data.department}\n` +
    `Primary contact: ${data.pocName || ''} (${data.pocEmail || ''})\n` +
    `Role: ${data.pocRole || ''}\n` +
    `Participants: ${data.participants || ''}\n` +
    `Prior n8n exposure: ${data.priorExposure || ''}\n` +
    `Requested level: ${data.sessionLevel || ''}\n` +
    `Primary goal:\n${data.primaryGoal || ''}\n\n` +
    'View the full request in the Google Sheet:\n' +
    ss.getUrl();

  MailApp.sendEmail({
    to: NOTIFY_RECIPIENTS.join(','),
    subject,
    body,
  });
}

// Handle Automation Request Form
function handleAutomationRequest(ss, data) {
  // Get or create the automation request sheet
  let sheet = ss.getSheetByName('n8n automation request');
  if (!sheet) {
    sheet = ss.insertSheet('n8n automation request');
  }

  // Column headers (auto-created once) - includes internal fields
  const headers = [
    'timestamp',
    'department',
    'pocName',
    'pocEmail',
    'pocRole',
    'automationTitle',
    'automationDescription',
    'expectedOutcome',
    'platforms',
    'customPlatforms',
    'integrationDetails',
    'urgency',
    'complexity',
    'access',
    'constraints',
    'budget',
    'successMetrics',
    'followUp',
    'additionalNotes',
    // Internal fields for tracking
    'status',
    'assignedTo',
    'internalNotes',
    'estimatedCompletion',
    'actualCompletion'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  // Append row
  const row = [
    new Date(),
    data.autoDepartment || '',
    data.autoPocName || '',
    data.autoPocEmail || '',
    data.autoPocRole || '',
    data.automationTitle || '',
    data.automationDescription || '',
    data.expectedOutcome || '',
    JSON.stringify(data.autoPlatforms || []),
    JSON.stringify(data.customPlatforms || []),
    data.integrationDetails || '',
    data.autoUrgency || '',
    data.autoComplexity || '',
    data.autoAccess || '',
    data.autoConstraints || '',
    data.autoBudget || '',
    data.autoSuccessMetrics || '',
    data.autoFollowUp || '',
    data.autoAdditionalNotes || '',
    // Internal fields - empty initially, to be filled manually
    'New', // status
    '', // assignedTo
    '', // internalNotes
    '', // estimatedCompletion
    ''  // actualCompletion
  ];

  sheet.appendRow(row);

  // Send notification email
  const subject = `New n8n automation request – ${data.automationTitle || 'Untitled'}`;

  const body =
    'A new n8n automation request has been submitted.\n\n' +
    `Department: ${data.autoDepartment || 'Unknown'}\n` +
    `Primary contact: ${data.autoPocName || ''} (${data.autoPocEmail || ''})\n` +
    `Role: ${data.autoPocRole || ''}\n\n` +
    `Automation Title: ${data.automationTitle || 'Untitled'}\n\n` +
    `Description:\n${data.automationDescription || ''}\n\n` +
    `Expected Outcome:\n${data.expectedOutcome || ''}\n\n` +
    `Platforms: ${Array.isArray(data.autoPlatforms) ? data.autoPlatforms.join(', ') : (data.autoPlatforms || 'None')}\n` +
    (data.customPlatforms && data.customPlatforms.length > 0 ? `Custom Platforms: ${data.customPlatforms.join(', ')}\n` : '') +
    `Urgency: ${data.autoUrgency || 'Not specified'}\n` +
    `Complexity: ${data.autoComplexity || 'Not specified'}\n` +
    `Access/Credentials: ${data.autoAccess || 'Not specified'}\n\n` +
    (data.autoConstraints ? `Constraints:\n${data.autoConstraints}\n\n` : '') +
    (data.autoSuccessMetrics ? `Success Metrics:\n${data.autoSuccessMetrics}\n\n` : '') +
    (data.autoAdditionalNotes ? `Additional Notes:\n${data.autoAdditionalNotes}\n\n` : '') +
    'View the full request in the Google Sheet:\n' +
    ss.getUrl() + '#gid=' + sheet.getSheetId();

  MailApp.sendEmail({
    to: NOTIFY_RECIPIENTS.join(','),
    subject,
    body,
  });
}

// Optional, so opening the URL in browser doesn't error
function doGet() {
  return ContentService
    .createTextOutput('n8n Request Forms endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function sendTestEmail() {
  MailApp.sendEmail({
    to: NOTIFY_RECIPIENTS.join(','),
    subject: 'Test from n8n Request Forms script',
    body: 'If you see this, MailApp is authorized and working.',
  });
}

