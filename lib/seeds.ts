import { Pin } from '@/types'

export const SEED_PINS: Pin[] = [
  // ── Airports ──────────────────────────────────────────────
  { id: 'seed-1', name: 'Ninoy Aquino Intl Airport (MNL)', category: 'airport', address: 'Pasay, Metro Manila', lat: 14.5086, lng: 121.0198, notes: 'Terminal 3 for most domestic flights. Meet at departure curb.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-2', name: 'Mactan-Cebu Intl Airport (CEB)', category: 'airport', address: 'Lapu-Lapu City, Cebu', lat: 10.3093, lng: 123.9794, notes: 'New Terminal 2 for international arrivals.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-3', name: 'El Nido Airport (ENI)', category: 'airport', address: 'Lio, El Nido, Palawan', lat: 11.2017, lng: 119.4192, notes: 'AirSWIFT flights only. 10 kg luggage limit.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-4', name: 'Bohol–Panglao Intl Airport (TAG)', category: 'airport', address: 'Panglao, Bohol', lat: 9.6601, lng: 123.7754, notes: 'Closer to Alona Beach than old Tagbilaran airport.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-5', name: 'Francisco Bangoy Intl Airport (DVO)', category: 'airport', address: 'Buhangin, Davao City', lat: 7.1255, lng: 125.6458, notes: null, link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },

  // ── Malls / Shopping ──────────────────────────────────────
  { id: 'seed-6', name: 'SM Mall of Asia', category: 'shopping', address: 'Seashore Blvd, Pasay', lat: 14.5347, lng: 120.9825, notes: 'One of the biggest malls in PH. Good food hall on 3rd floor. Bay views.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-7', name: 'Greenbelt Mall', category: 'shopping', address: 'Ayala Center, Makati', lat: 14.5519, lng: 121.0214, notes: 'Pasalubong run before the flight. Al fresco dining around the park.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-8', name: 'BGC High Street', category: 'shopping', address: 'Bonifacio Global City, Taguig', lat: 14.5502, lng: 121.0474, notes: 'Outdoor strip mall. Great for an evening stroll and dinner.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-9', name: 'Ayala Center Cebu', category: 'shopping', address: 'Cebu Business Park', lat: 10.3181, lng: 123.9056, notes: 'Backup plan if it rains in Cebu. Great food court.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-10', name: 'SM City Cebu', category: 'shopping', address: 'Juan Luna Ave, Cebu City', lat: 10.3116, lng: 123.9154, notes: null, link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-11', name: 'Robinsons Place Ermita', category: 'shopping', address: 'Pedro Gil St, Manila', lat: 14.5778, lng: 120.9840, notes: 'Convenient for souvenirs near Intramuros.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },

  // ── Tourist Spots ──────────────────────────────────────────
  { id: 'seed-12', name: 'Intramuros Walled City', category: 'tourist', address: 'Intramuros, Manila', lat: 14.5907, lng: 120.9754, notes: 'Hire a calesa or bamboo bike. Carlos guide booked 9am. Bring water.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-13', name: 'Chocolate Hills Viewpoint', category: 'tourist', address: 'Carmen, Bohol', lat: 9.9163, lng: 124.1730, notes: 'Sunrise climb — 214 steps. Bring a jacket for the wind up top.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-14', name: "Magellan's Cross", category: 'tourist', address: 'Plaza Sugbo, Cebu City', lat: 10.2939, lng: 123.9019, notes: 'Quick history stop. Basilica next door. Free entry.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-15', name: 'Kawasan Falls', category: 'tourist', address: 'Badian, Cebu', lat: 9.8126, lng: 123.3792, notes: 'Full-day canyoneering trip. NOT for Lola. Waterproof bags essential.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-16', name: 'Bacuit Bay Sunset Cruise', category: 'tourist', address: 'Bacuit Bay, El Nido', lat: 11.1742, lng: 119.3962, notes: 'Booked with Bugsay Tours · 4–7 pm · life vests for kids.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-17', name: 'Las Cabanas Beach', category: 'tourist', address: 'Las Cabanas, El Nido', lat: 11.1612, lng: 119.3756, notes: 'Best sundowner spot. Zipline for Jacob!', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-18', name: 'Loboc River Cruise', category: 'tourist', address: 'Loboc, Bohol', lat: 9.6360, lng: 124.0319, notes: 'Floating lunch buffet with live rondalla music. Book in advance.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-19', name: 'Hinagdanan Cave', category: 'tourist', address: 'Dauis, Panglao', lat: 9.6090, lng: 123.7886, notes: 'Underground swim. Bring slippers with grip — rocks are slippery.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-20', name: 'Basco Lighthouse', category: 'tourist', address: 'Naidi Hills, Basco, Batanes', lat: 20.4503, lng: 121.9710, notes: 'Optional Batanes extension Jun 28–Jul 2. Stunning rolling hills.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-21', name: 'Rizal Park (Luneta)', category: 'tourist', address: 'Ermita, Manila', lat: 14.5831, lng: 120.9794, notes: 'Evening light show at the fountain. Great family walk.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },

  // ── Food ──────────────────────────────────────────────────
  { id: 'seed-22', name: 'Toyo Eatery', category: 'food', address: 'Karrivin Plaza, Makati', lat: 14.5421, lng: 121.0102, notes: 'Reservation Jun 13, 7:30 pm. Try the Bahay Kubo salad!', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-23', name: 'Larsian BBQ', category: 'food', address: 'Fuente Osmeña, Cebu City', lat: 10.3091, lng: 123.8920, notes: 'Cebu lechon manok night. Go hungry — it gets busy.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-24', name: 'Pukka Bar', category: 'food', address: 'Las Cabanas Beach, El Nido', lat: 11.1604, lng: 119.3760, notes: 'Margaritas at sunset. Cash only.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-25', name: 'Merchantsquare Food Hall', category: 'food', address: 'BGC, Taguig', lat: 14.5530, lng: 121.0515, notes: 'Great variety of local and international food in BGC.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },

  // ── Accommodation ─────────────────────────────────────────
  { id: 'seed-26', name: 'Manila House Hotel', category: 'accommodation', address: 'BGC, Taguig', lat: 14.5512, lng: 121.0496, notes: '2 nights stopover before Palawan. Pool deck has great skyline views.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-27', name: 'Cuyog Beach Resort', category: 'accommodation', address: 'Corong-Corong, El Nido', lat: 11.1656, lng: 119.3892, notes: '3 nights · Family villa #4 · breakfast included.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-28', name: 'Panglao Bluewater Resort', category: 'accommodation', address: 'Panglao Island, Bohol', lat: 9.5731, lng: 123.7572, notes: '3 nights · adjoining rooms · snorkel gear included.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },

  // ── Transport ─────────────────────────────────────────────
  { id: 'seed-29', name: 'Cebu South Bus Terminal', category: 'transport', address: 'N. Bacalso Ave, Cebu City', lat: 10.2960, lng: 123.8911, notes: 'Bus to Oslob whale shark trip — 4 am. Buy tickets the night before.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
  { id: 'seed-30', name: 'Alona Beach Jeepney Stop', category: 'transport', address: 'Tawala, Panglao', lat: 9.5471, lng: 123.7717, notes: 'Hop-on jeepney to town. ₱20 per head.', link: null, added_by: null, created_at: '2026-01-01T00:00:00Z' },
]
