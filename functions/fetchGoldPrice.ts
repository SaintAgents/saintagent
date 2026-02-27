import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const apiKey = Deno.env.get("GOLD_API_KEY");
    if (!apiKey) {
      return Response.json({ error: 'GOLD_API_KEY not configured' }, { status: 500 });
    }

    const url = `https://api.metals.dev/v1/latest?api_key=${apiKey}&currency=USD&unit=g`;
    
    console.log('Fetching gold price from metals.dev API...');
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      return Response.json({ error: 'Failed to fetch gold price' }, { status: 500 });
    }

    const data = await response.json();
    console.log('Gold price data received:', JSON.stringify(data));

    // Extract gold price per gram
    const goldPricePerGram = data?.metals?.gold;
    
    if (!goldPricePerGram) {
      console.error('Gold price not found in response:', data);
      return Response.json({ error: 'Gold price not found in response' }, { status: 500 });
    }

    // Store the price in PlatformSetting
    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'gold_price_per_gram' });
    
    const priceData = {
      key: 'gold_price_per_gram',
      value: JSON.stringify({
        price: goldPricePerGram,
        currency: 'USD',
        unit: 'gram',
        updated_at: new Date().toISOString(),
        source: 'metals.dev'
      })
    };

    if (settings && settings.length > 0) {
      await base44.asServiceRole.entities.PlatformSetting.update(settings[0].id, priceData);
      console.log('Updated gold price setting:', goldPricePerGram);
    } else {
      await base44.asServiceRole.entities.PlatformSetting.create(priceData);
      console.log('Created gold price setting:', goldPricePerGram);
    }

    return Response.json({ 
      success: true, 
      gold_price_per_gram: goldPricePerGram,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});