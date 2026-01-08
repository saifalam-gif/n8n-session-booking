// 1) Teammates to notify
const NOTIFY_RECIPIENTS = [
  'saif.alam@nextventures.io',
  'api@wearenext.io',
  'api@nextventures.io',
  'aminul.islam@nextventures.io',
  'fahim@nextventures.io'
];

// 2) ClickUp API Configuration
// Get your ClickUp API token from: https://app.clickup.com/settings/apps
const CLICKUP_API_TOKEN = 'pk_101464525_0BT4XE4MR119HGRR63U112K9W9EPM09N';

// ClickUp List ID where tasks will be created
// List URL: https://app.clickup.com/3480971/v/l/li/901814926964
// The list ID is the number after /li/
const CLICKUP_LIST_ID = '901814926964';

// Optional: Set to true to enable ClickUp task creation, false to disable
const ENABLE_CLICKUP_TASKS = true;

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

  // Create ClickUp task
  if (ENABLE_CLICKUP_TASKS && CLICKUP_API_TOKEN !== 'YOUR_CLICKUP_API_TOKEN_HERE' && CLICKUP_LIST_ID !== 'YOUR_CLICKUP_LIST_ID_HERE') {
    try {
      createClickUpTask('session', data, ss.getUrl());
    } catch (error) {
      console.error('Error creating ClickUp task:', error);
      // Don't fail the form submission if ClickUp fails
    }
  }

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

  // Create ClickUp task
  if (ENABLE_CLICKUP_TASKS && CLICKUP_API_TOKEN !== 'YOUR_CLICKUP_API_TOKEN_HERE' && CLICKUP_LIST_ID !== 'YOUR_CLICKUP_LIST_ID_HERE') {
    try {
      createClickUpTask('automation', data, ss.getUrl() + '#gid=' + sheet.getSheetId());
    } catch (error) {
      console.error('Error creating ClickUp task:', error);
      // Don't fail the form submission if ClickUp fails
    }
  }

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

// Create ClickUp Task
function createClickUpTask(formType, data, sheetUrl) {
  if (!ENABLE_CLICKUP_TASKS || CLICKUP_API_TOKEN === 'YOUR_CLICKUP_API_TOKEN_HERE' || CLICKUP_LIST_ID === 'YOUR_CLICKUP_LIST_ID_HERE') {
    Logger.log('ClickUp task creation skipped: Configuration not set');
    return;
  }

  let taskName, taskDescription;

  if (formType === 'session') {
    // Session Request Task
    taskName = `n8n Session Request: ${data.department || 'Unknown Department'}`;
    
    taskDescription = 
      `Department: ${data.department || 'Unknown'}\n` +
      `Primary Contact: ${data.pocName || ''} (${data.pocEmail || ''})\n` +
      `Role: ${data.pocRole || ''}\n` +
      `Participants: ${data.participants || ''}\n` +
      `Prior n8n Exposure: ${data.priorExposure || ''}\n` +
      `Requested Level: ${data.sessionLevel || ''}\n\n` +
      `Primary Goal:\n${data.primaryGoal || ''}\n\n` +
      (data.sessionType ? `Session Type: ${Array.isArray(data.sessionType) ? data.sessionType.join(', ') : data.sessionType}\n` : '') +
      (data.tools ? `Tools: ${Array.isArray(data.tools) ? data.tools.join(', ') : data.tools}\n` : '') +
      (data.dateFrom ? `Preferred Date Range: ${data.dateFrom}${data.dateTo ? ' to ' + data.dateTo : ''}\n` : '') +
      (data.constraints ? `Constraints:\n${data.constraints}\n` : '') +
      (data.successDefinition ? `Success Definition:\n${data.successDefinition}\n` : '') +
      `\nView in Google Sheet:\n${sheetUrl}`;
  } else {
    // Automation Request Task
    taskName = `n8n Automation: ${data.automationTitle || 'Untitled'}`;
    
    const platforms = Array.isArray(data.autoPlatforms) ? data.autoPlatforms.join(', ') : (data.autoPlatforms || 'None');
    const customPlatforms = data.customPlatforms && data.customPlatforms.length > 0 ? data.customPlatforms.join(', ') : '';
    
    taskDescription = 
      `Department: ${data.autoDepartment || 'Unknown'}\n` +
      `Primary Contact: ${data.autoPocName || ''} (${data.autoPocEmail || ''})\n` +
      `Role: ${data.autoPocRole || ''}\n\n` +
      `Title: ${data.automationTitle || 'Untitled'}\n\n` +
      `Description:\n${data.automationDescription || ''}\n\n` +
      `Expected Outcome:\n${data.expectedOutcome || ''}\n\n` +
      `Platforms: ${platforms}\n` +
      (customPlatforms ? `Custom Platforms: ${customPlatforms}\n` : '') +
      `Urgency: ${data.autoUrgency || 'Not specified'}\n` +
      `Complexity: ${data.autoComplexity || 'Not specified'}\n` +
      `Access/Credentials: ${data.autoAccess || 'Not specified'}\n` +
      (data.autoConstraints ? `\nConstraints:\n${data.autoConstraints}\n` : '') +
      (data.autoSuccessMetrics ? `\nSuccess Metrics:\n${data.autoSuccessMetrics}\n` : '') +
      (data.autoAdditionalNotes ? `\nAdditional Notes:\n${data.autoAdditionalNotes}\n` : '') +
      `\nView in Google Sheet:\n${sheetUrl}`;
  }

  // ClickUp API endpoint
  const url = `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`;

  // Determine priority: 1 = Urgent, 2 = High, 3 = Normal, 4 = Low
  let priority = 3; // Default to Normal
  if (formType === 'automation' && data.autoUrgency === 'Immediate') {
    priority = 1; // Urgent
  } else if (formType === 'automation' && data.autoUrgency === 'Within 1 week') {
    priority = 2; // High
  }

  const payload = {
    name: taskName,
    description: taskDescription,
    priority: priority
    // Removed 'status' field - ClickUp will use the default status for the list
  };

  const options = {
    method: 'post',
    headers: {
      'Authorization': CLICKUP_API_TOKEN,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    Logger.log(`Creating ClickUp task: ${taskName}`);
    Logger.log(`URL: ${url}`);
    Logger.log(`Payload: ${JSON.stringify(payload)}`);

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log(`ClickUp API Response Code: ${responseCode}`);
    Logger.log(`ClickUp API Response: ${responseText}`);

    if (responseCode !== 200) {
      const errorMsg = `ClickUp API error: ${responseCode} - ${responseText}`;
      Logger.log(errorMsg);
      // Send error notification email
      MailApp.sendEmail({
        to: NOTIFY_RECIPIENTS.join(','),
        subject: 'ClickUp Task Creation Failed',
        body: `Failed to create ClickUp task for ${formType} request.\n\nError: ${errorMsg}\n\nTask Name: ${taskName}`
      });
      throw new Error(errorMsg);
    }

    const result = JSON.parse(responseText);
    Logger.log(`ClickUp task created successfully: ${result.id || 'Unknown ID'}`);
    return result;
  } catch (error) {
    Logger.log(`Error in createClickUpTask: ${error.toString()}`);
    // Send error notification email
    MailApp.sendEmail({
      to: NOTIFY_RECIPIENTS.join(','),
      subject: 'ClickUp Task Creation Error',
      body: `Error creating ClickUp task for ${formType} request.\n\nError: ${error.toString()}\n\nTask Name: ${taskName}`
    });
    throw error;
  }
}

// Test function to verify ClickUp API token and list access
function testClickUpConnection() {
  try {
    Logger.log('Testing ClickUp API connection...');
    Logger.log(`API Token: ${CLICKUP_API_TOKEN.substring(0, 20)}...`);
    Logger.log(`List ID: ${CLICKUP_LIST_ID}`);
    
    // Test 1: Get list info to verify access
    const listUrl = `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}`;
    const listOptions = {
      method: 'get',
      headers: {
        'Authorization': CLICKUP_API_TOKEN,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };
    
    Logger.log('Testing list access...');
    const listResponse = UrlFetchApp.fetch(listUrl, listOptions);
    const listResponseCode = listResponse.getResponseCode();
    const listResponseText = listResponse.getContentText();
    
    Logger.log(`List API Response Code: ${listResponseCode}`);
    Logger.log(`List API Response: ${listResponseText}`);
    
    if (listResponseCode === 200) {
      const listData = JSON.parse(listResponseText);
      Logger.log(`✓ Successfully accessed list: ${listData.name || 'Unknown'}`);
      Logger.log(`  List Name: ${listData.name}`);
      Logger.log(`  Space ID: ${listData.space?.id || 'N/A'}`);
    } else {
      Logger.log(`✗ Failed to access list. Error: ${listResponseText}`);
      return;
    }
    
    // Test 2: Create a test task
    Logger.log('\nTesting task creation...');
    const testTaskData = {
      autoDepartment: 'Technology',
      autoPocName: 'API Test',
      autoPocEmail: 'test@example.com',
      automationTitle: 'API Connection Test',
      automationDescription: 'This is a test task to verify API connection. You can delete this task.',
      expectedOutcome: 'Verify that tasks can be created via API'
    };
    
    const result = createClickUpTask('automation', testTaskData, 'https://example.com/test');
    
    if (result && result.id) {
      Logger.log(`✓ Test task created successfully!`);
      Logger.log(`  Task ID: ${result.id}`);
      Logger.log(`  Task Name: ${result.name}`);
      Logger.log(`  Task URL: ${result.url || 'N/A'}`);
      Logger.log('\n✓ All tests passed! Your ClickUp integration is working correctly.');
      Logger.log('\nYou can now delete the test task from your ClickUp list.');
    } else {
      Logger.log('✗ Task creation returned unexpected result');
    }
    
  } catch (error) {
    Logger.log(`✗ Test failed with error: ${error.toString()}`);
    Logger.log(`  Error details: ${error.stack || 'No stack trace'}`);
  }
}

// Simple function to trigger authorization dialog
// This uses a simple Google API call to trigger the authorization dialog
function authorizeClickUp() {
  try {
    Logger.log('Attempting to trigger authorization...');
    Logger.log('Making a simple external request to trigger authorization dialog...');
    
    // Use a simple external URL to trigger UrlFetchApp authorization
    // This should pop up the authorization dialog
    const response = UrlFetchApp.fetch('https://www.google.com', {
      muteHttpExceptions: true
    });
    
    Logger.log('✓ Basic authorization test passed!');
    Logger.log('Now testing ClickUp API...');
    
    // Now test ClickUp API
    const clickupResponse = UrlFetchApp.fetch('https://api.clickup.com/api/v2/user', {
      method: 'get',
      headers: {
        'Authorization': CLICKUP_API_TOKEN,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    });
    
    const responseCode = clickupResponse.getResponseCode();
    const responseText = clickupResponse.getContentText();
    
    Logger.log(`ClickUp API Response Code: ${responseCode}`);
    
    if (responseCode === 200) {
      Logger.log('✓ Authorization successful! API token is working.');
      const userData = JSON.parse(responseText);
      Logger.log(`✓ Connected as: ${userData.user?.username || 'Unknown user'}`);
      Logger.log('You can now use the testClickUpConnection() function.');
    } else {
      Logger.log(`ClickUp API Response: ${responseText}`);
      Logger.log(`Response code: ${responseCode} - Check if API token is valid.`);
    }
  } catch (error) {
    Logger.log(`Error: ${error.toString()}`);
    if (error.toString().includes('permission')) {
      Logger.log('');
      Logger.log('⚠️ AUTHORIZATION REQUIRED');
      Logger.log('');
      Logger.log('MANUAL AUTHORIZATION STEPS:');
      Logger.log('1. Click the three dots (⋮) in top right corner');
      Logger.log('2. Select "Project settings"');
      Logger.log('3. Scroll down to find "OAuth scopes" or "Authorization"');
      Logger.log('4. Look for "https://www.googleapis.com/auth/script.external_request"');
      Logger.log('5. If not listed, you may need to create a test deployment first');
      Logger.log('');
      Logger.log('ALTERNATIVE:');
      Logger.log('1. Go to: https://script.google.com/home/usersettings');
      Logger.log('2. Check "Google Cloud Platform (GCP) Project"');
      Logger.log('3. Create or select a GCP project');
      Logger.log('4. Then try running this function again');
    }
  }
}

// Even simpler test - just fetch Google
function simpleAuthTest() {
  UrlFetchApp.fetch('https://www.google.com');
  Logger.log('If you see this, authorization worked!');
}

