import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_EVENTS,
  INITIAL_INQUIRIES,
  INITIAL_OVERVIEW,
  INITIAL_VENDORS,
} from './src/data/collectiveData.ts';
import {
  CollectivePayload,
  PartnershipInquiry,
  PartnershipType,
  VendorCategory,
} from './src/types.ts';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'collective-store.json');

function cloneSeed(): CollectivePayload {
  return JSON.parse(
    JSON.stringify({
      overview: INITIAL_OVERVIEW,
      vendors: INITIAL_VENDORS,
      events: INITIAL_EVENTS,
      inquiries: INITIAL_INQUIRIES,
    }),
  ) as CollectivePayload;
}

function loadStore(): CollectivePayload {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as CollectivePayload;
      if (parsed && Array.isArray(parsed.vendors) && Array.isArray(parsed.events)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read persisted store, using seed data:', err);
  }
  return cloneSeed();
}

function saveStore(data: CollectivePayload) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist store to disk:', err);
  }
}

let store: CollectivePayload = loadStore();

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/collective', (_req, res) => {
    res.json(store);
  });

  app.patch('/api/vendors/:vendorId/inventory/:itemId', (req, res) => {
    const { vendorId, itemId } = req.params;
    const { delta } = req.body as { delta?: number };

    if (typeof delta !== 'number' || !Number.isInteger(delta) || delta === 0) {
      res.status(400).json({ error: 'A non-zero integer stock delta is required.' });
      return;
    }

    const vendor = store.vendors.find((v) => v.id === vendorId);
    if (!vendor) {
      res.status(404).json({ error: 'Vendor not found.' });
      return;
    }

    const item = vendor.inventory.find((sku) => sku.id === itemId);
    if (!item) {
      res.status(404).json({ error: 'Inventory item not found.' });
      return;
    }

    item.stock = Math.max(0, item.stock + delta);
    if (delta < 0) {
      item.unitsSold90d += Math.abs(delta);
    }

    saveStore(store);
    res.json({ vendor, item });
  });

  app.post('/api/events/:eventId/rsvp', (req, res) => {
    const { eventId } = req.params;
    const { name, email } = req.body as { name?: string; email?: string };

    if (!name || !name.trim() || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Please provide your full name and a valid email address.' });
      return;
    }

    const event = store.events.find((evt) => evt.id === eventId);
    if (!event) {
      res.status(404).json({ error: 'Community event not found.' });
      return;
    }

    if (event.registeredCount >= event.capacity) {
      res.status(409).json({ error: 'This gathering has reached full capacity.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const alreadyRegistered = event.attendees.some((a) => a.email.toLowerCase() === cleanEmail);
    if (alreadyRegistered) {
      res.status(409).json({ error: 'This email address is already registered for this event.' });
      return;
    }

    event.attendees.push({
      name: name.trim(),
      email: cleanEmail,
      registeredAt: new Date().toISOString(),
    });
    event.registeredCount += 1;

    saveStore(store);
    res.status(201).json({ event });
  });

  app.post('/api/inquiries', (req, res) => {
    const body = req.body as Partial<PartnershipInquiry>;

    if (!body.brandName?.trim() || !body.contactName?.trim()) {
      res.status(400).json({ error: 'Brand name and contact name are required.' });
      return;
    }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (!body.message?.trim() || body.message.trim().length < 15) {
      res
        .status(400)
        .json({ error: 'Please share at least a brief note (15+ characters) about your craft and goals.' });
      return;
    }

    const nextNumber = 104 + store.inquiries.length;
    const newInquiry: PartnershipInquiry = {
      id: `inq-${Date.now()}`,
      referenceCode: `HSC-2026-0${nextNumber}`,
      brandName: body.brandName.trim(),
      contactName: body.contactName.trim(),
      email: body.email.trim(),
      website: body.website?.trim() || '',
      category: body.category || VendorCategory.Ceramics,
      partnershipType: body.partnershipType || PartnershipType.ShelfSpace,
      monthlyVolume: body.monthlyVolume?.trim() || '15–30 units / month',
      message: body.message.trim(),
      submittedAt: new Date().toISOString(),
      status: 'Received',
    };

    store.inquiries.unshift(newInquiry);
    saveStore(store);
    res.status(201).json({ inquiry: newInquiry });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hello Sunshine Collective running on http://localhost:${PORT}`);
  });
}

startServer();
