# DuckCup User Guide

Welcome to DuckCup! This guide walks you through every feature of the application so you can get the most value out of your connected accounts and datasets. Whether you are just getting started or looking for tips on advanced analysis, this document covers it all.

## About The Application

DuckCup is a platform for connecting your communication channels, browsing your messages, building smart datasets, and running AI-powered analysis on top of them. The workflow is designed to be simple: connect accounts, filter the content you care about, save a dataset, and then use built-in tools to extract insights.

### Everything You Can Do

- Create an account and log in to access all features.
- Connect multiple Gmail accounts and multiple Telegram accounts in one place.
- More communication providers will be added in the future through the same provider onboarding flow.
- Browse your Gmail inbox with rich filtering and search.
- Browse Telegram entities (groups and channels) and their messages.
- Save any filtered slice of emails or messages as a named dataset.
- Use publicly available datasets for testing analysis workflows without needing your own data.
- Open saved datasets and explore their content with date filters and sender filters.
- Extract the most important keywords and n-grams from a dataset.
- Cluster all messages in a dataset into meaningful groups automatically.
- Cluster messages per sender so you can see what each sender is talking about.
- Generate AI-powered titles for each cluster.
- Summarize any cluster using Hugging Face or Pollination models.
- Select a custom group of messages and summarize them together.
- Use the command palette to navigate quickly and trigger actions without leaving the keyboard.
- Switch between light and dark mode.
- Manage open pages as tabs and reorder them to match your workflow.

### High-Level Architecture Diagram
![DuckCup high-level architecture](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/app-overview.png)

---

## Navigation And The Tab Bar

DuckCup uses a tab-based navigation system. Every page you visit opens as a tab in the top bar, and you can have multiple pages open at the same time without losing your place.

### Working With Tabs
![Tabs navigation](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/tabs_navigation.gif)



- Click any page in the left sidebar to open it as a tab.
- Click a tab to switch to that page.
- Right-click a tab to open the context menu with these options:
  - **Close this tab** — removes just this tab.
  - **Close all tabs** — clears the entire tab bar.
  - **Close other tabs** — keeps only the tab you right-clicked and closes the rest.
  - **Move tab left / Move tab right** — reorders tabs manually.
- You can also drag tabs left or right to reorder them.

### Light And Dark Mode

The theme toggle button in the top navigation bar switches between dark mode (the default) and light mode. Your preference is saved locally and remembered across sessions.


![Light/Dark mode](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/theme_toggle.gif)

---

## Command Palette

The command palette is a quick-action search bar built into the top navigation. It lets you navigate to any page or trigger common actions without reaching for the mouse.

![Command bar](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/command.gif)


### How To Use It

- Click the search bar in the top navigation bar or press Ctrl + Alt + P.
- A results panel opens showing matching commands.
- Up to 8 results are shown at a time, ranked by relevance.
- Click any result to run its action immediately.

### Available Commands

Navigation commands are generated automatically for every page. You can type things like:
- "open home" — navigates to the Home page.
- "go to emails" — navigates to Gmail.
- "navigate to datasets" — navigates to the Datasets page.
- "open telegram" — navigates to Telegram Messages.
- "open guide" — navigates to this User Guide.

In addition to navigation, there are action commands:
- **Add an account** — opens the add account popup directly. Aliases: create account, register account.
- **Logout** — logs you out immediately. Aliases: log out, sign out, disconnect.
- **Close all tabs** — clears all open tabs. Aliases: close tabs, clear tabs.

### Tips

- You do not need to type the exact command name. The search is fuzzy and matches against keywords and descriptions.
- Use the command palette to jump between pages instead of clicking the sidebar each time.

---

## Login

The Login page is the entry point to the application. Most pages require authentication, so logging in is your first step. You can either sign in with an existing account or register a brand new one from the same screen.

![Login](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/login.gif)


### Signing In

1. Enter your **username** and **password**.
2. Click **Login**.
3. After a successful login, you are redirected and all protected pages become available.

### Creating A New Account

1. Click **Register** to switch to registration mode.
2. Enter a **username** and **password**.
3. Click **Register** to create your account.
4. You are automatically authenticated and can start using the app.

### Use Cases

- First-time user registers and immediately starts connecting accounts.
- Returning user logs in to continue analysis from a previous session.
- User sees a login error and retries with corrected credentials.



---

## Home Page

The Home page is your dashboard. It gives you a quick snapshot of the application state, lets you manage accounts and datasets at a glance, and is where you configure the API keys that unlock AI-powered features.



### Application Status Card
![Login](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/user_card.png)

At the top of the Home page you will see a status card showing:
- Your **username**.
- Your account status (Online).
- The number of accounts you have connected.
- The number of datasets you have saved.

### Your Datasets

![user_ds_card](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/user_ds_card.png)

A compact table lists all your saved datasets with:
- Dataset number and name.
- The number of emails or messages it contains.
- A delete button to remove any dataset you no longer need.

### Your Accounts

![user_accounts](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/user_accounts.png)

The accounts section gives you a searchable, manageable list of all connected accounts. You can add new accounts, delete existing ones, and re-login accounts that need credential renewal. If an account token is no longer valid, a **Re-login** button is shown for that account, and you need to log in again to activate it. This is covered in full in the User Accounts section of this guide.

### API Keys

The API Keys card at the bottom of the Home page is where you configure Hugging Face and Pollination tokens. Setting these keys is what unlocks the AI-powered summarization and title generation features across the application.

**Hugging-Face & Pollination Tokens**

![user_keys](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/user_keys.png)


- Shows account meta information when valid.
- Status indicator: **Valid** (green) or **Not valid or not set**.
- If not set: click **Set token** to open the key entry popup.
- If set: click the trash icon to delete the key.
- Click **Open Website** to go to token documentation.

**Security Note:** When you enter an API key, it is encrypted on your device using an RSA public key sent by the server before being transmitted. The key is stored encrypted in the backend database as well, so it is never held in plain text at rest or in transit.

### Use Cases

- Set your Hugging-Face or Pollinations token once to unlock cluster summarization for all datasets.
- Delete an expired Pollination key and replace it with a new one.


---

## User Accounts

The Accounts page lets you manage all the provider connections you have set up. You can connect multiple Gmail accounts and multiple Telegram accounts, and they will all be available in the Gmail and Telegram pages.

### Connecting A New Account

![accounts_login](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/accounts_login.png)

1. Click **Add an account** (or use the command palette and type "add account").
2. A popup shows the available providers (for example Gmail, Telegram).
3. Click the provider card to start the connection flow.
4. Depending on the provider's authentication method:
  - **Gmail login** — a Gmail authentication page is opened, and you must sign in to your Gmail account. After the authentication is completed successfully, the Gmail account card appears in your accounts list. For troubleshooting, refer to the backend documentation.
  - **Telegram login** — a popup asks for `api_id`, `api_hash`, and `phone_number`. You can get `api_id` and `api_hash` from [https://my.telegram.org](https://my.telegram.org) under **API development tools**. If these values are valid, a second popup asks for the code sent to your Telegram account and your Telegram 2FA password (if enabled). The code and password are sent directly to the Telegram API only for authentication and are not stored; only an encrypted version of the access token is saved so you can keep accessing your Telegram messages.
5. On successful connection, the account appears in your list.

### Re-Login An Expired Account

If an account shows **Need re-login: Yes**, click the **Re-login** button on that account card. This takes you through the authentication flow again for that provider.

### Navigating To Account Content

Each account card has a quick-navigation button:
- **Go to emails** — for Gmail accounts, navigates to the Gmail page.
- **Go to entities** — for Telegram accounts, navigates to the Telegram page.

### Deleting An Account

Click the trash icon on an account card. A confirmation popup appears before permanent deletion.

### Use Cases

- Connect two personal Gmail accounts and one work Gmail account.
- Add Telegram to access group message analysis.
- Delete an account you no longer use.

---

## Emails

The Emails page is where you browse, search, and filter your connected Gmail accounts. Once you are happy with the filtered results you can save the whole filtered set as a dataset for later analysis.
You can also open individual emails to inspect them.

### Sidebar

The left sidebar lists all your Gmail accounts. Expanding an account shows the most recently loaded emails as clickable child rows, each labelled with the sender signature and date.

![emails_sidebar](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/emails_sidebar.gif)


- Clicking an account scrolls the main page to that account's card.
- Clicking a child email row opens the email details popup directly.
- The sidebar loads email previews when you click an account or expand the sidebar.

### Account Email Card

![emails_card](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/emails_card.png)


Each Gmail account gets its own card in the main area containing:
- A **criteria panel** for building a query.
- A **datatable** showing the results.
- A **save dataset** button.

### Email Criteria Filters

Before loading emails, you can narrow your query with these filters:

![emails_filter](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/emails_filter.gif)


- **Sender** — type a sender's name or email address. Autocomplete suggestions are loaded from your inbox metadata.
- **Subject** — type a subject keyword. Autocomplete suggestions are also available covering known subjects.
- **Date from / Date to** — date range pickers. The min and max available dates are automatically constrained to your actual inbox date range.
- **Sort by** — choose one of:
  - **Newest first** (default)
  - **Oldest first**
  - **Sender name**

After setting criteria, click **Get emails** to load results. You can also click the refresh icon to reload with the same criteria.

### Email Table Columns

The results table includes:
- **Subject** — email subject line.
- **Date** — formatted timestamp.
- **Sender email** — from address.
- **Sender signature** — display name of the sender.
- **Flags** — inbox flags such as Seen or Unseen.
- **Contains attachment** — whether the email has a file attached.
- **Content** — a preview of the email body (truncated to about 10 words).

You can sort any column by clicking its header (a small arrow shows the current sort direction). Use the global search box at the top of the table to filter across all visible columns at once, or use per-column filter inputs for precision.

### Performance And Caching

Emails are fetched using the IMAP protocol, which is inherently slower than local database queries. To reduce waiting time, results are cached for 5 minutes per combination of account, page number, page size, and criteria. If you see a "cached at" timestamp under the table, the data came from cache. Click the refresh icon to bypass cache and get fresh results.

### Email Details Popup

Click any row to open the full email details popup:

![email_details](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/email_details.png)


- All email fields are displayed in a structured view (sender, date, subject, flags, body).
- Click **Show HTML** to open the original rendered email in a separate popup.
- HTML interactivity is disabled by default (links and buttons are non-clickable) as a security measure to protect you from malicious content. You can toggle interactivity on if needed, but use caution with unknown senders.

### Saving As A Dataset

![save_emails_dataset](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/save_emails_dataset.png)

Once you are satisfied with the filtered result, click the **Save as dataset** button to open the save popup:
1. **Dataset scope** — shows the criteria you applied and the total email count that will be included.
2. **Language note** — English emails are the supported language for dataset analysis at this stage.
3. **Dataset name** — type a name for your dataset. Suggested names (for example AlphaDs, BetaDs) are offered for inspiration; only names that do not already exist are suggested.
4. Click **Save dataset**. A loading toast appears while the dataset is being built on the server. On success you are redirected to the Datasets page.

### Use Cases

- Pull all emails from a specific sender to analyse communication patterns.
- Filter by subject keyword and date range to focus on a project discussion thread.
- Open a suspicious email in HTML view to inspect its content safely.
- Save a monthly inbox slice as a dataset for keyword extraction.
- Use the sender autocomplete to quickly find the right person without typing a full address.

---

## Telegram

The Telegram page lets you browse messages from your connected Telegram accounts, explore groups, channels and users (called entities), apply rich filters, and save focused message sets as datasets.

### Sidebar

All Telegram accounts appear in the sidebar. Each account expands to show the active entities (groups, channels and users).

![telegram_sidebar](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/telegram_sidebar.png)

- Click an account in the sidebar to scroll to its card.

### Choosing Entities — Sender Selection

![telegram_senders.gif](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/telegram_senders.gif)


Inside each account card you will see a list of entity chips (senders):
- Each chip shows the entity name and its fetched message count (0 if inactive).
- Click a chip to fetch its messages. Selected entities are highlighted.
- Selecting an entity triggers an automatic message fetch for that entity.
- Use the **search box** above the chips to search for entities by name or ID.
- Only 5 entities chips are shown initially. Click **Show more** to reveal 5 more at a time.
- You can select multiple entities at the same time and their messages will all appear in the table below combined.
- For each selected entity, use the **Message limit** dropdown (options: 50, 100, 200, 500, 1000) to control how many messages from that entity are loaded. The default is 100.


### Date Filters

![tg_dates](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/tg_dates.gif)


Use the date filter buttons above the table to narrow messages by time window:
- **Last hour / Last 3 hours / Last 12 hours** — very recent content.
- **Today / Yesterday** — single-day windows.
- **Last week / Last 3 weeks / Last month / Last 6 months / Last year** — longer historical ranges.

Only one preset date filter is active at a time. Selecting a different preset replaces the previous one.

Alternatively, use the **specific date range** inputs to set an explicit start and end date. 
This mode is direct and intentional: whatever you enter is applied exactly with no rounding. 
Using an explicit range deactivates the preset buttons, and activating a preset clears the explicit range.

Date filter row counts update whenever you change your sender selection, so the number on each button always reflects the messages visible with your current sender filter.

### Keywords filter
![telegram_keywords](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/tg_keywords.gif)

Each chip shows a keyword represented in the messages and how many messages contain it.
Click one or more keyword chips to show their associated messages in the table. 
This is useful for quickly isolating messages that discuss a specific person or organization.


### Message Table Columns

![telegram_messages](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/telegram_messages.png)

The combined messages from all selected entities appear in a datatable:
- **Date** — message timestamp, formatted for readability.
- **Sender username** — who sent the message.
- **Text** — message text, truncated to about 10 words as a preview.
- **Views** — view count of the message.
- **Forwards** — how many times the message was forwarded.
- **Media** — Yes or No indicating whether the message has a media attachment.

Click any row to open the message details popup.

### Message Details Popup

Click any message row to open a full details popup showing all message fields. If the message contains media, the popup automatically loads a preview:
- **Images** — shown inline.
- **Videos** — playable directly in the popup.
- **Audio** — playable with standard controls.
- If media is unavailable or fails to load, a clear message is shown instead.

### Entity Details Popup

Each entity also has a details button that opens a full record: chat ID, chat name, chat type, and any additional metadata stored.

### Collapsable cards
![collapsable_cards](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/tg_collapsable.gif)

Take benefit from the collapsing cards if you want to have better view.


### Saving As A Dataset

Once you have selected senders and applied date filters to define your scope:
1. Click **Save as dataset**.
2. Enter a **dataset name**.
3. The popup shows the scope that will be saved.
4. Click **Save**. The dataset is created from the currently filtered messages.
5. Navigate to the **Datasets** page to start analysis.

### Use Cases

- Monitor a group channel by loading the most recent 200 messages.
- Select 3 active senders and compare their messages side by side.
- Filter to the last month across 5 entities and save as a dataset for clustering.
- Use entity analysis chips to find all messages mentioning a specific organization.
- Open a message with media to preview an image or video without leaving the app.
- Use explicit date range to pull messages from an exact two-week window.

---

## Datasets

The Datasets page is the analytical heart of the application. Once you have saved a dataset from Gmail or Telegram, you come here to explore it in depth and run NLP operations on it.

### Sidebar Navigation

The left sidebar lists all your datasets. Each dataset shows its name and message/email count. Clicking a dataset opens its content in the main area. Each dataset also has child links to its operations:
- **Dataset keywords**
- **Clusters per sender**
- **Clusters all**
- **Summarize messages groups**

![dataset sidebar navigation](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/dataset_sidebar.gif)

Clicking an operation link in the sidebar scrolls directly to that operation section on the page without needing to scroll manually.

### Dataset-Level Filters

Use these filters before running operations to scope the analysis to a subset of the data:

**Sender filter chips** — a chip for each unique sender in the dataset. Select one or more to filter rows to those senders. selecting a sender will update the other filters' counts. Deselect all chips to go back to all senders. 

![filter by sender](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/filter_by_sender.png)

**Date filter presets:**

You can choose one of the preset data filters:
- Last hour / Last 3 hours / Last 12 hours
- Today / Yesterday / Last week / Last 3 weeks
- Last month / Last 6 months / Last year
![date filters preset](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/preset_date_filters.png)

You can only choose one. 
Whenever you choose one, the dates inside `filter with specific date range` would be empty.
When you choose a filter, the `filter by sender` filter will be having only senders that their messages in the date range.


**Specific date range** 
You can choose explicit start or end date.
Using this deactivates `Date filter presets` filter.


**Filter by Entity** 
Here you can see the different entities included inside your dataset. the entities are grouped into category, each category represent the group type. 

> In backend, we are using spacy NER. Entity types would not be 100% accurate. 

![dataset keywords filter](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/dataset_keywords_filter.gif)


You can select an entity and the datatable will show only messages/emails containing this keyword.




All operations use the filtered subset, not the full dataset.

### Deleting A Dataset

Click the **Delete dataset** button in the section header. A confirmation popup appears before permanent deletion.

> !Deletion will delete your dataset file.

---

### Operation: Dataset Keywords

This operation extracts the most significant terms from the dataset to give you a rapid topic overview. It will extract using TF-IDF scoring.

**Controls:**
- **N-grams count** — how many top terms to return (default: 100, must be a positive integer).
- **Advanced key extractor** button — runs a KeyBert keyword extractor instead of TF-IDF.

**Output:** A grid of keyword chips. Each chip shows the term and its relevance score formatted to 4 decimal places. Higher score = more significant term.

---

### Operation: Clusters Per Sender

Groups the messages from each sender into topic clusters independently. The result tells you what topics each individual sender focused on.

**Algorithm options:**
- **tokens_kmeans** — fast text-token-based K-Means. Good starting point for most datasets.
- **semantics_kmeans** — embedding-based K-Means that groups semantically similar messages even if they use different words.
- **lda** — Latent Dirichlet Allocation, a probabilistic topic model, useful for overlapping topics.
- **advanced** — (default) the system chooses the best approach automatically.

**K clusters** — the number of groups to create per sender (1–999, default: 4). This field is hidden when using the advanced algorithm since it decides the count automatically.

**Advanced options panel (expandable):**
- **Embedder type** — select the embedding backend for semantic algorithms (options loaded dynamically from backend).
- **Model name** — enter a specific embedding model name.
- A link to discover available models from external model hubs is included.

**Output:** A grid of cluster cards grouped per sender. Each card shows:
- Sender name
- Cluster title (auto-generated or AI-generated)
- Document count
- Expandable messages datatable with the full rows in that cluster

![cluster per sender](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/cluster_per_sender.png)

---

### Operation: Clusters All

Clusters every message in the dataset together regardless of sender. The result is a set of topic groups representing the overall themes across all communications.

The controls and algorithm options are identical to Clusters Per Sender. The key difference is sender identity is ignored — every message is treated equally. This is the best operation when you want a bird's eye view of what the entire dataset is about.

**Output:** A grid of cluster cards. Each card shows a cluster title, document count, a sender breakdown summary (which senders contributed to this cluster), and an expandable messages table.



### AI Features On Cluster Cards

Every cluster card (from both Clusters Per Sender and Clusters All) has two AI-powered actions. These require a valid Hugging Face or Pollination API key set on the Home page.

**Generate Cluster Title**
1. Click the magic wand icon on a cluster card.
2. Choose your **AI provider** (Hugging Face or Pollination) and the **model** to use.
3. The app shows an estimated prompt and token cost so you know what will be sent.
4. Click **Generate**. The AI returns a descriptive title for the cluster.
5. You can run it multiple times to get a better result or refine further.


![refine title](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/refine_title.gif)



**Summarize Cluster**
1. Click the summarize button on a cluster card.
2. Choose provider and model.
3. Review token cost estimates (input + output).
4. Click **Summarize**. The summary text appears inside the card.

![Summarize cluster](https://raw.githubusercontent.com/antoinsader/duckcup/publish/frontend/public/docs/user_guide_assets/summarize_cluster.gif)
---

### Operation: Summarize Messages Groups

This is the most flexible analysis tool on the page. Instead of summarizing a whole cluster, you manually pick any group of messages and summarize just those.

**Steps:**
1. Use the **sender filter chips** and **date filters** (including a custom date range) to narrow the rows shown.
2. Use the row **checkboxes** to select the specific messages you want to include.
3. Click **Get Prompt** to preview the prompt that will be sent to the AI and the estimated token count (both input and output). This lets you see what the model will receive before committing.
4. Select a **provider** and **model**.
5. Click **Summarize** to generate the summary.
6. The summary answer is displayed in a text area below.

This is especially powerful when you want to summarize a specific conversation thread, a batch of messages on a single topic, or a curated sample you selected by hand rather than trusting the automatic clustering.

---

### Dataset Use Cases

- Load a customer-support email dataset and run keywords to find the most common complaint topics.
- Cluster messages per sender to understand each team member's focus areas for a project.
- Cluster all messages to get a general topic map of a Telegram group channel.
- Generate AI titles for every cluster in one session so the results are self-documenting.
- Select the 10 most relevant messages on a topic and summarize them without running a full cluster.
- Apply a date filter then re-run clustering to compare this month versus last month in the same dataset.
- Use LDA if you expect messages to belong to multiple topics at once.

---

## Profile

The Profile page shows your current session information and gives you a clean way to log out.

### What You Can See

- **Username** — your account identifier.
- **Connection status** — shows "Connected" with a green indicator when authenticated.
- **Session status** — shows "Active session".

### Logging Out

Click the **Logout** button to end your session. This clears all locally cached email data, calls the logout endpoint on the server, and redirects you to the Login page. A success or error toast is shown.

You can also log out from the command palette by typing "logout".

---

## Tips And Best Practices

### Getting The Most Out Of Datasets

- Give datasets specific, descriptive names like "Support emails Jan 2026" or "Dev channel March" so they are easy to identify later.
- Use the filters inside the Datasets page to run operations on a time window rather than saving many small datasets.
- Always run **Dataset keywords** first — the top terms will tell you instantly whether the data is what you expected.
- Use **Clusters per sender** when you want to analyse individual contributors, and **Clusters all** when you want the full topic landscape.
- The **Summarize messages groups** operation is the best choice when you have already identified the rows that matter and want a focused summary.

### Optimizing Email Queries

- Use the **Sender autocomplete** — it only suggests senders that actually exist in your inbox so you avoid empty results.
- Combine a narrow date range and a sender filter for the fastest and most focused queries.
- Results are cached for 5 minutes. If you need the latest emails after a cache hit, click the refresh icon.

### API Keys And AI Models

- Adding both a Hugging Face and a Pollination key gives you the widest model selection.
- Hugging Face is better for open-source and fine-tuned models. Pollination is a simpler option for getting started quickly.
- Token cost estimates are shown before every AI call so there are no surprises.
- API keys are encrypted before storage and can be deleted and replaced at any time from the Home page.

### Using Commands Efficiently

- The command palette is the fastest way to switch between pages.
- Type partial words — "tele" will match "Telegram messages", "data" will match "Datasets".
- Use "add account" from the palette when you want to connect a new provider without navigating to the Accounts page first.
