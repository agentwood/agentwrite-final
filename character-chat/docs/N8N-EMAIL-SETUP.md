# n8n Email Configuration (Optional)

The voice audit workflow includes email notifications, but they require email credentials to be configured.

## Option 1: Disable Email Notifications (Quickest)

If you don't need email notifications, simply **delete or disable** the email nodes:

1. In n8n workflow editor, locate these nodes:
   - "Send Approval Notification"
   - "Send Failure Notification"

2. **Right-click each node** → **Delete**

3. **Save the workflow**

4. **Activate the toggle**

## Option 2: Configure Email (Gmail Example)

### Step 1: Create App Password (Gmail)

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Create a new app password named "n8n"
4. Copy the 16-character password

### Step 2: Configure in n8n

1. In n8n, go to **Settings** → **Credentials**
2. Click **"+ New Credential"**
3. Search for and select **"SMTP"**
4. Fill in:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Password: [paste app password]
   SSL/TLS: Use TLS
   ```
5. Click **"Save"**

### Step 3: Configure Email Nodes

1. Open the workflow
2. Click on **"Send Approval Notification"** node
3. In the **"From Email"** field: `your-email@gmail.com`
4. In the **"Credentials"** dropdown: Select the SMTP credential you just created
5. Repeat for **"Send Failure Notification"** node
6. **Save** and **Activate**

## Option 3: Use Webhook Instead

Replace email notifications with Discord/Slack/Webhook:

1. Delete email nodes
2. Add **"HTTP Request"** nodes
3. Point to your Discord/Slack webhook URL
4. Much simpler!

## Recommended for Testing

**Just delete the email nodes** and activate the workflow. You can add them back later if needed.
