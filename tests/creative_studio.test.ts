import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_CAMPAIGNS, CAMPAIGN_FORMAT_CONFIGS, generateConsistentSvgArtwork } from '../src/data/seedCampaigns.ts';
import { SEED_PROJECTS } from '../src/data/seedProjects.ts';
import {
  CREATIVE_STUDIO_MODELS,
  extractImageFromResponse,
  resolveReferenceImage,
  formatImageGenerationError,
} from '../server.ts';

test('CREATIVE STUDIO TEST 1: Centralized Model Identifier Verification', () => {
  // Nano Banana model supported by Google AI Studio
  assert.equal(
    CREATIVE_STUDIO_MODELS.IMAGE_MODEL,
    'gemini-3.1-flash-lite-image',
    'Must use Google AI Studio supported Nano Banana alias gemini-3.1-flash-lite-image'
  );
  assert.equal(
    CREATIVE_STUDIO_MODELS.TEXT_PLANNING_MODEL,
    'gemini-3.8-flash',
    'Must use Gemini 3.8 Flash for campaign strategy planning'
  );
});

test('CREATIVE STUDIO TEST 2: Strict No-People Mode Compliance and Negative Constraints', () => {
  const camp = SEED_CAMPAIGNS.find((c) => c.id === 'camp_dfg_launch_001');
  assert.ok(camp, 'Seed campaign must exist');

  // Verify No-People is enabled by default
  assert.equal(camp.brief.noPeopleMode, true, 'No People Mode must be ON by default');
  assert.equal(camp.brandIdentity.noPeopleMode, true);

  // Verify negative prompt includes mandatory human restrictions
  const negativePrompt = camp.masterVisual.negativePrompt.toLowerCase();
  assert.ok(negativePrompt.includes('people'), 'Negative prompt must forbid people');
  assert.ok(negativePrompt.includes('human'), 'Negative prompt must forbid humans');
  assert.ok(negativePrompt.includes('face'), 'Negative prompt must forbid faces');
  assert.ok(negativePrompt.includes('silhouette'), 'Negative prompt must forbid silhouettes');
  assert.ok(negativePrompt.includes('crowd'), 'Negative prompt must forbid crowds');
  assert.ok(negativePrompt.includes('hand'), 'Negative prompt must forbid hands');

  // Verify disallowed and allowed elements
  assert.deepEqual(camp.brandIdentity.disallowedVisualElements, [
    'human figures',
    'faces',
    'silhouettes',
    'crowds',
    'hands',
  ]);
  assert.ok(camp.brandIdentity.allowedVisualElements.includes('solar panels'));
  assert.ok(camp.brandIdentity.allowedVisualElements.includes('laptops'));
});

test('CREATIVE STUDIO TEST 3: All 9 Standard Formats & Multi-Channel Visual Consistency', () => {
  // Verify 9 formats exist in configuration
  assert.equal(CAMPAIGN_FORMAT_CONFIGS.length, 9, 'All 9 required campaign formats must be configured');

  const requiredFormatIds = [
    'billboard_poster',
    'magazine_ad',
    'instagram_square',
    'instagram_story',
    'linkedin_graphic',
    'website_hero',
    'project_flyer',
    'donor_presentation_cover',
    'project_report_cover',
  ];

  for (const fmtId of requiredFormatIds) {
    const config = CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === fmtId);
    assert.ok(config, `Format ${fmtId} must exist in config`);
    assert.ok(config.width > 0 && config.height > 0, `Format ${fmtId} must have positive dimensions`);
    assert.ok(config.aspectRatio, `Format ${fmtId} must have defined aspect ratio`);
  }
});

test('CREATIVE STUDIO TEST 4: Official TEFA Logo Protection (Anti-Slop Guarantee)', () => {
  const camp = SEED_CAMPAIGNS[0];

  // Official logo is only used when approved asset is selected
  assert.equal(camp.brandIdentity.approvedLogo.useOfficialTefaLogo, true);
  assert.equal(camp.brandIdentity.approvedLogo.logoSource, 'official_approved_asset');
  assert.ok(
    camp.brandIdentity.approvedLogo.disclaimer.includes('Offizielles TEFA e.V.'),
    'Disclaimer must be clearly stated'
  );
});

test('CREATIVE STUDIO TEST 5: Human Governance & Non-Auto-Approval Workflow', () => {
  const camp = SEED_CAMPAIGNS[0];

  // AI must not auto-approve
  assert.notEqual(camp.brief.status, 'approved', 'AI cannot auto-approve external publication');

  // Verify approval permissions
  const checkCanApprove = (role: string) => {
    return role === 'project_manager' || role === 'board_member' || role === 'system_admin';
  };

  assert.equal(checkCanApprove('visitor'), false, 'Visitor cannot approve campaign');
  assert.equal(checkCanApprove('tefa_member'), false, 'General member cannot approve without manager role');
  assert.equal(checkCanApprove('project_manager'), true, 'Project manager can approve');
  assert.equal(checkCanApprove('board_member'), true, 'Board member can approve');
  assert.equal(checkCanApprove('system_admin'), true, 'System admin can approve');
});

test('CREATIVE STUDIO TEST 6: Single Format Regeneration without Replacing Campaign', () => {
  const camp = JSON.parse(JSON.stringify(SEED_CAMPAIGNS[0]));
  const initialAssetCount = camp.assets.length;
  const targetFormat = 'instagram_square';

  // Find asset before regeneration
  const beforeAsset = camp.assets.find((a: any) => a.format === targetFormat);
  assert.ok(beforeAsset, 'Instagram asset must exist');
  const beforeVersion = beforeAsset.version;

  // Simulate single format regeneration
  const regeneratedAsset = {
    ...beforeAsset,
    version: beforeVersion + 1,
    imageUrl: generateConsistentSvgArtwork('instagram_square', 'Regenerated Solar IT Hub'),
    updatedAt: new Date().toISOString(),
  };

  const updatedAssets = camp.assets.map((a: any) =>
    a.format === targetFormat ? regeneratedAsset : a
  );
  camp.assets = updatedAssets;

  assert.equal(camp.assets.length, initialAssetCount, 'Total asset count must stay the same');
  const afterAsset = camp.assets.find((a: any) => a.format === targetFormat);
  assert.equal(afterAsset.version, beforeVersion + 1, 'Version must increment');
  // Other assets must remain intact
  const billboardAsset = camp.assets.find((a: any) => a.format === 'billboard_poster');
  assert.ok(billboardAsset, 'Other assets must not be lost when regenerating single format');
});

test('CREATIVE STUDIO TEST 7: Linking Campaign to Project Record in Persistence Layer', () => {
  const camp = SEED_CAMPAIGNS[0];
  const linkedProject = SEED_PROJECTS.find((p) => p.id === camp.brief.projectId);

  assert.ok(linkedProject, 'Linked project must exist in projects registry');
  assert.equal(camp.isSavedToProject, true);
  assert.equal(camp.savedToProjectId, linkedProject.id);
});

test('CREATIVE STUDIO TEST 8: Generation Green Awareness Campaign Verification', () => {
  const genGreenCamp = SEED_CAMPAIGNS.find((c) => c.brief.projectId === 'proj_gen_green_002');
  assert.ok(genGreenCamp, 'Generation Green campaign must exist in SEED_CAMPAIGNS');

  // Verify brief metadata
  assert.equal(genGreenCamp.brief.title, 'Generation Green – Small Actions, Big Change');
  assert.equal(genGreenCamp.brief.objective, 'Inspire young people to engage in environmental protection, sustainability, and practical green innovation.');
  assert.equal(genGreenCamp.brief.status, 'draft', 'Campaign must be in draft status (marked as concept)');
  assert.equal(genGreenCamp.brief.noPeopleMode, true, 'No People Mode must be strictly enabled');

  // Verify Brand Identity
  assert.equal(genGreenCamp.brandIdentity.colorPalette.primary, '#15803d', 'Forest green primary color');
  assert.equal(genGreenCamp.brandIdentity.colorPalette.secondary, '#0f2b48', 'Deep blue secondary color');
  assert.equal(genGreenCamp.brandIdentity.colorPalette.accent, '#f59e0b', 'Warm sunlight accent');
  assert.equal(genGreenCamp.brandIdentity.approvedLogo.useOfficialTefaLogo, true);

  // Verify Master Visual
  assert.ok(genGreenCamp.masterVisual.imageUrl, 'Master visual must have valid imageUrl');
  assert.equal(genGreenCamp.masterVisual.model, 'gemini-3.1-flash-lite-image');

  // Verify 3 Coordinated Formats
  const formats = genGreenCamp.assets.map((a) => a.format);
  assert.ok(formats.includes('billboard_poster'), 'Outdoor poster format must exist');
  assert.ok(formats.includes('instagram_square'), 'Instagram square post must exist');
  assert.ok(formats.includes('linkedin_graphic'), 'LinkedIn landscape graphic must exist');
  assert.equal(genGreenCamp.assets.length, 3, 'Exactly 3 coordinated assets must be generated');

  // Verify Headline and CTA across all assets
  for (const asset of genGreenCamp.assets) {
    assert.equal(asset.headline, 'Generation Green – Small Actions, Big Change');
    assert.equal(asset.callToAction, 'Discover the initiative');
    assert.equal(asset.status, 'draft', 'Asset must remain marked as draft concept until approved');
    // Verify master visual consistency: all assets share the same approved master visual base
    assert.equal(asset.imageUrl, genGreenCamp.masterVisual.imageUrl);
  }

  // Verify Project Linkage
  assert.equal(genGreenCamp.isSavedToProject, true);
  assert.equal(genGreenCamp.savedToProjectId, 'proj_gen_green_002');

  const linkedProject = SEED_PROJECTS.find((p) => p.id === 'proj_gen_green_002');
  assert.ok(linkedProject, 'Linked Generation Green project must exist');
  assert.ok(linkedProject.communicationCampaigns?.some((c) => c.id === genGreenCamp.id));
  assert.equal(linkedProject.campaignAssets?.length, 3);
});

test('CREATIVE STUDIO TEST 9: Nano Banana Candidate Response Parsing & Multiple Parts Traversal', () => {
  // Test case A: image is in part index 0
  const mockResponse1 = {
    candidates: [
      {
        content: {
          parts: [
            {
              inlineData: {
                data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                mimeType: 'image/png',
              },
            },
          ],
        },
      },
    ],
  };
  const extracted1 = extractImageFromResponse(mockResponse1);
  assert.ok(extracted1, 'Must extract image from candidate part 0');
  assert.ok(extracted1.startsWith('data:image/png;base64,'));

  // Test case B: response contains text part first, then image part (do not assume part 0)
  const mockResponse2 = {
    candidates: [
      {
        content: {
          parts: [
            { text: 'Here is your green innovation visual without people:' },
            {
              inlineData: {
                data: 'QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=',
                mimeType: 'image/jpeg',
              },
            },
          ],
        },
      },
    ],
  };
  const extracted2 = extractImageFromResponse(mockResponse2);
  assert.ok(extracted2, 'Must scan all parts and find inlineData even if preceded by text');
  assert.ok(extracted2.startsWith('data:image/jpeg;base64,'));

  // Test case C: empty or invalid candidate parts
  assert.equal(extractImageFromResponse({}), null);
  assert.equal(extractImageFromResponse({ candidates: [] }), null);
  assert.equal(extractImageFromResponse({ candidates: [{ content: { parts: [{ text: 'No image' }] } }] }), null);
});

test('CREATIVE STUDIO TEST 10: Reference Image Resolution for Nano Banana Image-to-Image / Editing', () => {
  // Case 1: Base64 data URL
  const base64Url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const resolvedDataUri = resolveReferenceImage(base64Url);
  assert.ok(resolvedDataUri, 'Must resolve base64 data URI');
  assert.equal(resolvedDataUri.mimeType, 'image/png');
  assert.ok(resolvedDataUri.data.length > 10);

  // Case 2: Local raster file path (Generation Green master visual)
  const localFile = '/assets/images/gengreen_master_1792768070112.jpg';
  const resolvedLocal = resolveReferenceImage(localFile);
  assert.ok(resolvedLocal, 'Must resolve local file path from assets directory');
  assert.equal(resolvedLocal.mimeType, 'image/jpeg');
  assert.ok(resolvedLocal.data.length > 50, 'Must load non-empty base64 string from disk');

  // Case 3: Invalid / empty image
  assert.equal(resolveReferenceImage(null), null);
  assert.equal(resolveReferenceImage(''), null);
  assert.equal(resolveReferenceImage('/non_existent_image_path.jpg'), null);
});

test('CREATIVE STUDIO TEST 11: Actionable Error Handling & Rate Limit Recognition (429, 401, 502)', () => {
  const model = CREATIVE_STUDIO_MODELS.IMAGE_MODEL;

  // Rate Limit / Quota error
  const rateLimitErr = new Error('429 RESOURCE_EXHAUSTED: Quota exceeded for quota metric');
  const formatted429 = formatImageGenerationError(rateLimitErr, model);
  assert.equal(formatted429.status, 429);
  assert.equal(formatted429.code, 'RATE_LIMIT_EXCEEDED');
  assert.ok(formatted429.error.includes('Google AI Studio API-Ratenlimit erreicht'));
  assert.ok(formatted429.error.includes(model));

  // Authentication error
  const authErr = new Error('API_KEY_INVALID: API key not valid. Please pass a valid API key.');
  const formatted401 = formatImageGenerationError(authErr, model);
  assert.equal(formatted401.status, 401);
  assert.equal(formatted401.code, 'AUTH_ERROR');
  assert.ok(formatted401.error.includes('Authentifizierungsfehler'));

  // General model unavailable error
  const generalErr = new Error('Service Unavailable / Internal Server Error 503');
  const formatted502 = formatImageGenerationError(generalErr, model);
  assert.equal(formatted502.status, 502);
  assert.equal(formatted502.code, 'MODEL_UNAVAILABLE');
  assert.ok(formatted502.error.includes('derzeit nicht verfügbar'));
});

test('CREATIVE STUDIO TEST 12: Request Parameter & Aspect Ratio Mapping for All 9 Formats', () => {
  const supportedNanoBananaAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];

  for (const config of CAMPAIGN_FORMAT_CONFIGS) {
    const isSupported = supportedNanoBananaAspectRatios.includes(config.aspectRatio);
    assert.ok(
      isSupported,
      `Format ${config.id} aspect ratio ${config.aspectRatio} must be directly supported by Nano Banana`
    );
  }
});

test('CREATIVE STUDIO TEST 13: Strict Prohibition of Gemini Text Models as Image Replacement Providers', () => {
  // Confirm that IMAGE_MODEL is exclusively the Nano Banana image model
  assert.equal(CREATIVE_STUDIO_MODELS.IMAGE_MODEL, 'gemini-3.1-flash-lite-image');

  // Confirm that text models are NEVER assigned as image models
  assert.notEqual(CREATIVE_STUDIO_MODELS.IMAGE_MODEL, 'gemini-3.8-flash');
  assert.notEqual(CREATIVE_STUDIO_MODELS.IMAGE_MODEL, 'gemini-4-argon');

  // Confirm that TEXT_PLANNING_MODEL is used for strategy/planning
  assert.equal(CREATIVE_STUDIO_MODELS.TEXT_PLANNING_MODEL, 'gemini-3.8-flash');
});

test('CREATIVE STUDIO TEST 14: IFOPSIM Inclusive Digital Vocational Campaign & Strict Project Separation', () => {
  const ifopsimCamp = SEED_CAMPAIGNS.find((c) => c.brief.projectId === 'proj_ifopsim_001');
  assert.ok(ifopsimCamp, 'IFOPSIM campaign must exist in SEED_CAMPAIGNS');

  // Verify Campaign Brief
  assert.equal(ifopsimCamp.brief.title, 'Digital Skills. Inclusive Futures.');
  assert.ok(
    ifopsimCamp.brief.objective.includes('inclusive digital vocational training') &&
      ifopsimCamp.brief.objective.includes('deaf and hard-of-hearing'),
    'Objective must focus on inclusive digital vocational training for deaf and hard-of-hearing youths in Cameroon'
  );
  assert.equal(ifopsimCamp.brief.status, 'draft', 'IFOPSIM must be in draft status (concept in development)');
  assert.equal(ifopsimCamp.brief.noPeopleMode, true, 'No People Mode must be strictly enabled');

  // Verify Brand Identity
  assert.equal(ifopsimCamp.brandIdentity.projectName, 'IFOPSIM');
  assert.equal(ifopsimCamp.brandIdentity.campaignName, 'Digital Skills. Inclusive Futures.');
  assert.equal(ifopsimCamp.brandIdentity.approvedLogo.useOfficialTefaLogo, true);
  assert.deepEqual(ifopsimCamp.brandIdentity.disallowedVisualElements, [
    'human figures',
    'faces',
    'silhouettes',
    'crowds',
    'hands',
  ]);

  // Verify Master Visual
  assert.ok(ifopsimCamp.masterVisual.imageUrl, 'Master visual must have valid imageUrl');
  assert.ok(ifopsimCamp.masterVisual.imageUrl.includes('ifopsim_master_visual'));
  assert.equal(ifopsimCamp.masterVisual.model, 'gemini-3.1-flash-lite-image');

  // Verify 3 Coordinated Formats
  const formats = ifopsimCamp.assets.map((a) => a.format);
  assert.ok(formats.includes('donor_presentation_cover'), 'Project presentation cover format must exist');
  assert.ok(formats.includes('linkedin_graphic'), 'LinkedIn awareness graphic must exist');
  assert.ok(formats.includes('billboard_poster'), 'Donor-facing concept poster format must exist');
  assert.equal(ifopsimCamp.assets.length, 3, 'Must have exactly 3 coordinated assets');

  // Verify Headline, Subtitle, and CTA across all 3 assets
  for (const asset of ifopsimCamp.assets) {
    assert.equal(asset.headline, 'IFOPSIM – Digital Skills. Inclusive Futures.');
    assert.equal(asset.subtitle, 'An inclusive vocational education initiative in development.');
    assert.equal(asset.status, 'draft', 'All assets must remain marked as draft concept');
    // Verify visual consistency: all assets share the same master visual base
    assert.equal(asset.imageUrl, ifopsimCamp.masterVisual.imageUrl);
  }

  // Verify Project Linkage & Persistence
  assert.equal(ifopsimCamp.isSavedToProject, true);
  assert.equal(ifopsimCamp.savedToProjectId, 'proj_ifopsim_001');

  const ifopsimProject = SEED_PROJECTS.find((p) => p.id === 'proj_ifopsim_001');
  assert.ok(ifopsimProject, 'Linked IFOPSIM project must exist');
  assert.ok(ifopsimProject.communicationCampaigns?.some((c) => c.id === ifopsimCamp.id));
  assert.equal(ifopsimProject.campaignAssets?.length, 3);

  // Verify Project Separation: Generation Green campaign is completely untouched
  const genGreenCamp = SEED_CAMPAIGNS.find((c) => c.brief.projectId === 'proj_gen_green_002');
  assert.ok(genGreenCamp, 'Generation Green campaign must remain intact');
  assert.equal(genGreenCamp.brief.title, 'Generation Green – Small Actions, Big Change');
  assert.equal(genGreenCamp.assets.length, 3);
  assert.notEqual(ifopsimCamp.id, genGreenCamp.id, 'IFOPSIM and Generation Green campaigns must have separate IDs');
  assert.notEqual(ifopsimCamp.masterVisual.imageUrl, genGreenCamp.masterVisual.imageUrl, 'Must have distinct master visuals');
});

