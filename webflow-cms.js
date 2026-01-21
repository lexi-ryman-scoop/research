#!/usr/bin/env node

/**
 * Webflow CMS Automation Script
 *
 * Usage:
 *   node webflow-cms.js list-collections
 *   node webflow-cms.js list-items <collection-id>
 *   node webflow-cms.js create-item <collection-id> <json-data>
 *   node webflow-cms.js update-item <collection-id> <item-id> <json-data>
 *   node webflow-cms.js delete-item <collection-id> <item-id>
 */

const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN || 'd80f0401d9f38719979ce74ba898729dfff9af4981dd9ccf059624aabefa151b';
const SITE_ID = process.env.WEBFLOW_SITE_ID || '65fdc9041545b81c2e66e5ac';
const BASE_URL = 'https://api.webflow.com/v2';

async function webflowRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
      'accept': 'application/json',
      'content-type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

async function listCollections() {
  console.log('Fetching CMS collections...\n');
  const data = await webflowRequest(`/sites/${SITE_ID}/collections`);

  if (data.collections && data.collections.length > 0) {
    console.log('=== Your Webflow CMS Collections ===\n');
    data.collections.forEach((col, i) => {
      console.log(`${i + 1}. ${col.displayName || col.slug}`);
      console.log(`   ID: ${col.id}`);
      console.log(`   Slug: ${col.slug}`);
      console.log(`   Singular Name: ${col.singularName}`);
      console.log(`   Item Count: ${col.lastUpdated ? 'Has items' : 'Unknown'}`);
      console.log('');
    });
  } else {
    console.log('No collections found.');
  }

  return data;
}

async function listItems(collectionId) {
  console.log(`Fetching items from collection ${collectionId}...\n`);
  const data = await webflowRequest(`/collections/${collectionId}/items`);

  if (data.items && data.items.length > 0) {
    console.log(`=== Collection Items (${data.items.length} total) ===\n`);
    data.items.forEach((item, i) => {
      console.log(`${i + 1}. ${item.fieldData?.name || item.fieldData?.title || item.id}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Slug: ${item.fieldData?.slug || 'N/A'}`);
      console.log(`   Status: ${item.isDraft ? 'Draft' : 'Published'}`);
      console.log('');
    });
  } else {
    console.log('No items found in this collection.');
  }

  return data;
}

async function createItem(collectionId, fieldData) {
  console.log(`Creating new item in collection ${collectionId}...\n`);
  const data = await webflowRequest(`/collections/${collectionId}/items`, 'POST', {
    fieldData,
    isDraft: false
  });

  console.log('Item created successfully!');
  console.log(`ID: ${data.id}`);
  return data;
}

async function updateItem(collectionId, itemId, fieldData) {
  console.log(`Updating item ${itemId} in collection ${collectionId}...\n`);
  const data = await webflowRequest(`/collections/${collectionId}/items/${itemId}`, 'PATCH', {
    fieldData
  });

  console.log('Item updated successfully!');
  return data;
}

async function deleteItem(collectionId, itemId) {
  console.log(`Deleting item ${itemId} from collection ${collectionId}...\n`);
  await webflowRequest(`/collections/${collectionId}/items/${itemId}`, 'DELETE');
  console.log('Item deleted successfully!');
}

async function main() {
  const [,, command, ...args] = process.argv;

  try {
    switch (command) {
      case 'list-collections':
        await listCollections();
        break;

      case 'list-items':
        if (!args[0]) {
          console.error('Usage: node webflow-cms.js list-items <collection-id>');
          process.exit(1);
        }
        await listItems(args[0]);
        break;

      case 'create-item':
        if (!args[0] || !args[1]) {
          console.error('Usage: node webflow-cms.js create-item <collection-id> \'{"name": "Item Name", "slug": "item-slug"}\'');
          process.exit(1);
        }
        await createItem(args[0], JSON.parse(args[1]));
        break;

      case 'update-item':
        if (!args[0] || !args[1] || !args[2]) {
          console.error('Usage: node webflow-cms.js update-item <collection-id> <item-id> \'{"name": "New Name"}\'');
          process.exit(1);
        }
        await updateItem(args[0], args[1], JSON.parse(args[2]));
        break;

      case 'delete-item':
        if (!args[0] || !args[1]) {
          console.error('Usage: node webflow-cms.js delete-item <collection-id> <item-id>');
          process.exit(1);
        }
        await deleteItem(args[0], args[1]);
        break;

      default:
        console.log(`
Webflow CMS Automation Script
=============================

Commands:
  list-collections              List all CMS collections for your site
  list-items <collection-id>    List all items in a collection
  create-item <coll-id> <json>  Create a new item
  update-item <coll-id> <item-id> <json>  Update an existing item
  delete-item <coll-id> <item-id>  Delete an item

Examples:
  node webflow-cms.js list-collections
  node webflow-cms.js list-items 6789abc123def
  node webflow-cms.js create-item 6789abc123def '{"name": "New Post", "slug": "new-post"}'
        `);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
