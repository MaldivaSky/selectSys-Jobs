# SELECTSYS JOBS - TECHNICAL SPECIFICATION FOR GEMINI IMPLEMENTATION

Based on deep analysis of existing codebase, documentation, and business vision documents.

## EXECUTIVE SUMMARY

The current codebase contains foundational elements (form schema, domain models, package structure) but lacks implementation of the core value-delivering features described in the business vision and technical plan. This specification details exactly what needs to be built to transform SelectSys Jobs from a basic framework into a multi-tenant SaaS platform that naturally attracts and retains multiple dekassegui recruitment agencies.

## MISSING CORE FEATURES

Despite having a comprehensive plan (PLANO_MASTER_SENIOR.md) and business vision (docs/analise_selectsys-jobs.txt), the following critical features are NOT implemented:

### 1. RESUME IMPORT FEATURE (Highest Priority - Phase 1)
**Status**: NOT IMPLEMENTED
**Location Reference**: PLANO_MASTER_SENIOR.md Fase 1, docs/analise_selectsys-jobs.txt

**Missing Components**:
- File upload endpoint (`POST /api/candidate/resume-import`)
- Claude AI integration for resume parsing (PT/JPN)
- Resume-to-FUJIARTE form mapping service
- Secure file validation (MIME type, 5MB limit, virus scanning)
- Audit logging with file SHA-256 hashes
- UI component for resume import in candidate flow
- Edit interface for candidate to review/fix extracted data
- Security controls: NO auto-population of Bloco B (health) data

**Technical Details**:
- Must reuse existing Claude API integration referenced in architecture
- Must validate against Zod schema generated from form_schemas
- Must store in `application_data` JSONB versioned field
- Must generate audit events for all import actions
- Must support bilingual resume parsing (PT/JPN)

### 2. DASHBOARD & METRICS SYSTEM (Phase 2)
**Status**: NOT IMPLEMENTED
**Location Reference**: PLANO_MASTER_SENIOR.md Fase 2, docs/analise_selectsys-jobs.txt (Executive Dashboard)

**Missing Components**:
- Metrics collection and aggregation services
- Real-time dashboard UI components
- Export functionality (CSV/PDF via @react-pdf/renderer)
- Role-based access control (analyst+ roles)
- Organization-level data isolation via RLS

**Missing Metrics to Implement**:
- Funnel conversion rates (11 stages → 17 states)
- Time per stage with SLA violation detection
- Screening decision effectiveness by reason_code
- Matching score distribution and accuracy
- Agency performance metrics
- Executive Cost-per-hire calculation
- Predictive success indicators
- WhatsApp/IA cost tracking

**Technical Details**:
- Leverage existing tables: `pipeline_events`, `screening_decisions`, `match_scores`
- Build with TanStack Table + TanStack Query (already in stack)
- Ensure ZERO Bloco B (health) data exposure in any dashboard
- Implement RLS policies for organization data isolation
- Near real-time updates (max 5min delay)

### 3. INTEGRATION HUB (From Business Vision)
**Status**: NOT IMPLEMENTED
**Location Reference**: docs/analise_selectsys-jobs.txt Section 2

**Missing Components**:
- Integration framework and connector architecture
- Pre-built connectors for target systems:
  - **Japanese Systems**: Garoon (cloud/on-prem), Cybozu Office, Japanese visa/COE systems
  - **ERP/Contábil**: TOTVS, SAP Business One, ContaAzul
  - **Productivity**: Google Workspace, Microsoft 365, Slack
  - **Video Conferencing**: Zoom, Teams, Google Meet
  - **Translation Services**: Gengo, Unbabel (optional to Claude)

**Technical Requirements**:
- AsyncAPI definitions for all integration contracts
- `/integrations/` directory with connector templates
- Sandbox mode for testing integrations
- Webhook handling system with retry logic
- Encrypted credential storage (AWS KMS / HashiCorp Vault equivalent)
- Rate limiting and quota management per organization
- Integration health monitoring and alerting
- Usage-based billing (Starter pays per connector, Growth/Enterprise included)

### 4. WORKFLOW BUILDER (From Business Vision)
**Status**: NOT IMPLEMENTED
**Location Reference**: docs/analise_selectsys-jobs.txt Section 4

**Missing Components**:
- Visual workflow builder UI (Zapier-like for dekassegui)
- Workflow storage and versioning system
- Trigger/condition/action engine
- Pre-built dekassegui-specific triggers/actions
- Workflow execution and monitoring
- Audit trail for workflow executions

**Technical Details**:
- Triggers: Pipeline state changes (e.g., "entrevista_realizada")
- Conditions: Candidate data checks (experience, skills, documents)
- Actions: 
  - Internal: Update candidate status, create tasks
  - External: Send WhatsApp/email, call webhooks, update external systems
  - Notifications: To staff, agencies, candidates
- Integration with existing pg-boss for job queue
- Workflow versioning and rollback capability
- Execution logging and error handling

### 5. CANDIDATE MARKETPLACE & REFERRAL SYSTEM
**Status**: NOT IMPLEMENTED
**Location Reference**: docs/analise_selectsys-jobs.txt Section 3A

**Missing Components**:
- Candidate marketplace UI for browsing available candidates
- Consent management for marketplace participation (LGPD versioned)
- Referral bonus tracking and payment system (R$ 150-300)
- Automated non-compete conflict detection
- Agency performance leaderboards
- Marketplace search and filtering capabilities

**Technical Details**:
- Only candidates with "admissão_concluida" in last 6 months eligible
- Automatic bonus payment upon successful placement
- Conflict detection using agency/client data
- Performance metrics: submissions, interviews, hires per agency
- GDPR/LGPD compliant consent management with versioning

### 6. CERTIFICATION PROGRAM
**Status**: NOT IMPLEMENTED
**Location Reference**: docs/analise_selectsys-jobs.txt Section 5

**Missing Components**:
- Learning Management System (LMS) for course delivery
- Quiz/assessment system for certification
- Certification tracking per agency/user
- Digital badge generation and display
- Benefit application system (discounts, directory listing)
- Webinar hosting and tracking

**Technical Details**:
- Practitioner level: Free 4h course on platform + dekassegui + LGPD
- Specialist level: Practitioner + 3 months usage + config test + referral
- Partner level: Specialist + 3+ client referrals + 90% retention + marketplace participation
- Benefits: Badges, directory listing, discounts, commissions, strategic meetings

### 7. CANDIDATE PORTAL 2.0
**Status**: NOT IMPLEMENTED
**Location Reference**: docs/analise_selectsys-jobs.txt Section 7

**Missing Components**:
- Visual timeline with celebration milestones
- Interactive document checklist with direct upload
- Multilingual chatbot (PT/JA/ES) using existing Claude integration
- Explanatory videos for each dekassegui stage
- Post-marco satisfaction tracking (internal NPS)
- Friend referral system with bonuses
- Mobile-optimized experience (80% candidates use mobile)

**Technical Details**:
- Timeline visualizations with celebratory milestones
- Document checklist with status tracking and upload
- Chatbot for FAQs using existing Claude capabilities
- Video embeds for process explanations
- NPS surveys after key milestones
- Referral tracking with automatic bonus application

### 8. PRICING & BILLING SYSTEM
**Status**: NOT IMPLEMENTED
**Location Reference**: docs/analise_selectsys-jobs.txt Section 1 (Price Tiered)

**Missing Components**:
- Tiered pricing model implementation:
  - Starter: R$ 299/mês (50 candidaturas, +15% form completion, -30% triagem time)
  - Growth: R$ 799/mês (200 candidaturas, >92% Japão acceptance, executive dashboard, advanced WhatsApp)
  - Enterprise: R$ 1.999+/mês (unlimited, anonymous benchmarking, unlimited API/webhooks, dedicated manager, 99.9% SLA, custom training)
- Usage-based billing for variables:
  - Additional resumo imports beyond plan limits
  - Additional WhatsApp messages
  - Additional Claude API usage
  - Additional active connectors (Starter: R$ 49/conector/mês)
- Subscription management and invoicing
- Payment gateway integration (Asaas for BRL, Stripe for JPY/international)
- Revenue recognition and reporting

## TECHNICAL ARCHITECTURE GAPS

### Currently Working:
- Monorepo structure with workspaces (app, packages/*)
- Basic TypeScript setup
- Form schema definition (`ficha-fujiarte-2024-06.ts`)
- Domain models (status, japao)
- Package.json configurations
- Documentation

### Missing/Critical Gaps:
1. **API Layer**: No REST/API endpoints for new features
2. **Service Layer**: No business logic services for resume parsing, metrics, integrations
3. **Data Layer**: Missing database tables/migrations for new features
4. **UI Layer**: Missing React components for all new features
5. **Infrastructure**: Missing file storage setup, credential encryption, webhook handling
6. **Testing**: Missing unit, integration, and E2E tests for new features
7. **Security**: Missing specific security validations for new data flows

## DATABASE SCHEMA EXTENSIONS NEEDED

Based on the missing features, these tables need to be added:

### Resume Import Tracking
```sql
CREATE TABLE resume_imports (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_hash TEXT NOT NULL, -- SHA-256 of original file
  imported_by UUID REFERENCES users(id),
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extracted_data JSONB, -- Raw Claude extraction
  mapped_data JSONB, -- Data mapped to form schema
  validation_errors JSONB, -- Any Zod validation errors
  edited_by UUID REFERENCES users(id), -- Who edited after import
  edited_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_mime CHECK (mime_type IN ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  CONSTRAINT valid_size CHECK (file_size <= 5242880) -- 5MB
);
```

### Metrics & Analytics
```sql
CREATE TABLE metric_snapshots (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_labels JSONB, -- For dimensional metrics (e.g., by vaga, by setor)
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE dashboard_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  layout JSONB NOT NULL, -- Widget positions, sizes, visibility
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Integrations
```sql
CREATE TABLE integration_connectors (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  connector_type TEXT NOT NULL, -- garoon, sap, google_workspace, etc.
  configuration JSONB NOT NULL, -- Encrypted credentials, settings
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT, -- success, error, pending
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE integration_logs (
  id UUID PRIMARY KEY,
  connector_id UUID REFERENCES integration_connectors(id),
  action TEXT NOT NULL, -- sync, webhook_received, etc.
  status TEXT NOT NULL, -- success, error
  request_payload JSONB,
  response_payload JSONB,
  error_details JSONB,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Workflow Builder
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL, -- The workflow structure (triggers, conditions, actions)
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id),
  trigger_data JSONB, -- What triggered this execution
  execution_path JSONB, -- Path taken through conditions
  actions_executed JSONB[], -- Which actions were fired
  results JSONB[], -- Results of each action
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT, -- running, completed, failed, cancelled
  error_details JSONB
);
```

### Marketplace & Referrals
```sql
CREATE TABLE marketplace_candidates (
  id UUID PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id),
  organization_id UUID REFERENCES organizations(id), -- Owning agency
  status TEXT NOT NULL CHECK (status IN ('available', 'matched', 'hired', 'removed')),
  available_from TIMESTAMP WITH TIME ZONE NOT NULL,
  available_until TIMESTAMP WITH TIME ZONE,
  competencies JSONB, -- Skills, experience, certifications
  salary_expectation NUMERIC,
  preferred_locations TEXT[], -- Japanese provinces
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referring_organization_id UUID REFERENCES organizations(id),
  referred_organization_id UUID REFERENCES organizations(id),
  candidate_id UUID REFERENCES candidates(id),
  bonus_amount NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
  referred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  hired_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Certification & Badges
```sql
CREATE TABLE certifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  level TEXT NOT NULL CHECK (level IN ('practitioner', 'specialist', 'partner')),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  certificate_id TEXT UNIQUE NOT NULL,
  metadata JSONB, -- Course completion details, test scores
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_reason TEXT
);

CREATE TABLE certification_benefits (
  id UUID PRIMARY KEY,
  certification_id UUID REFERENCES certifications(id),
  benefit_type TEXT NOT NULL, -- discount, directory_listing, commission, etc.
  benefit_value JSONB, -- Details of the benefit
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

## SECURITY & COMPLIANCE REQUIREMENTS

Based on docs/01-analise-documentos.md Section 4 (Risks) and docs/analise_selectsys-jobs.txt:

### Non-Negotiable Security Controls:
1. **Bloco B Data Protection**: 
   - NEVER auto-populate health data from resume imports
   - Bloco B fields remain empty until explicit candidate entry with versioned consent
   - All health data encrypted at column level with pgcrypto
   - Strict access logging for health data access

2. **File Upload Security**:
   - Strict MIME type validation (magic bytes, not extension)
   - 5MB file size limit
   - Virus scanning (ClamAV) in background worker
   - Secure file storage (Cloudflare R2 with signed URLs)
   - File type validation: ONLY PDF/DOCX

3. **Data Isolation**:
   - Row Level Security (RLS) on ALL tables
   - organization_id mandatory on every table
   - No cross-organization data leakage possible
   - Regular RLS policy testing

4. **Audit Trail Completeness**:
   - Every resume import logged with: user, IP, timestamp, file hash
   - Every dashboard access logged for sensitive metrics
   - Every integration action logged with payloads
   - Every workflow execution logged with triggers and results
   - All audit logs immutable and tamper-evident

5. **Consent Management**:
   - Versioned consent for all data usages
   - Explicit consent required for marketplace participation
   - Consent tracking with timestamp, IP, user-agent
   - Easy consent withdrawal mechanism
   - Consent versioning when policies change

6. **Rate Limiting & Abuse Prevention**:
   - API rate limiting per organization/user
   - File upload limits per day/user
   - Integration call limits to prevent abuse
   - Webhook delivery retry limits
   - Marketplace search limits to prevent scraping

## IMPLEMENTATION PRIORITY ORDER

Based on business value and dependencies:

### Phase 1: Core Value Delivery (Weeks 1-3)
1. **Resume Import Feature** - Direct candidate time savings, immediate value
2. **Basic Metrics Dashboard** - Enables data-driven decisions
3. **Integration Hub Framework** - Foundation for pre-built connectors

### Phase 2: Network Effects & Retention (Weeks 4-6)
1. **Candidate Marketplace** - Creates agency interdependence
2. **Referral System** - Incentivizes agency-to-agency referrals
3. **Basic Workflow Builder** - Enables customization without dev involvement

### Phase 3: Professional Lock-in & Premium (Weeks 7-8)
1. **Certification Program** - Turns agencies into sales channel
2. **Enhanced Candidate Portal 2.0** - Improves placement success
3. **Advanced Analytics & Predictive Features** - Executive value

### Phase 4: Monetization & Scale (Weeks 9-10)
1. **Tiered Pricing System** - Implements business vision pricing
2. **Usage-Based Billing** - Tracks and bills for variables
3. **Enterprise Features** - Dedicated support, SLAs, custom training

## VALIDATION CRITERIA

Each feature must meet these criteria to be considered "done":

### Functional:
- [ ] All specified features work as described
- [ ] Edge cases handled (empty files, invalid data, network failures)
- [ ] User flows are intuitive and documented
- [ ] Error states provide clear guidance
- [ ] Mobile-responsive where applicable (80% mobile usage)

### Technical:
- [ ] Code follows existing project conventions
- [ ] Proper error handling and logging
- [ ] Database migrations included and tested
- [ ] Unit test coverage ≥ 80% for new logic
- [ ] Integration tests for API endpoints
- [ ] Security review passed
- [ ] Performance benchmarks met (where specified)

### Security & Compliance:
- [ ] Zero Bloco B data exposure in resume import
- [ ] File upload security validated (MIME, size, viruses)
- [ ] RLS policies tested and working
- [ ] Audit trails complete and immutable
- [ ] Consent management LGPD-compliant
- [ ] Encryption at rest and in transit for sensitive data
- [ ] Regular security scanning passed

### Business Value:
- [ ] Resume import reduces form completion time by 60-70%
- [ ] Dashboard reduces gerencial analysis time by 50%
- [ ] Marketplace increases successful placements
- [ ] Certification program creates referral channel
- [ ] Candidate portal improvements reduce abandonment
- [ ] Pricing model aligns with delivered business value

## IMMEDIATE ACTIONS FOR GEMINI

1. **Familiarize with existing codebase**:
   - Run `npm install` in root
   - Study `packages/core/src/form/` and `packages/core/src/domain/`
   - Review `docs/02-arquitetura-e-stack.md` for technical choices
   - Examine `PLANO_MASTER_SENIOR.md` for implementation approach

2. **Start with Resume Import** (highest immediate value):
   - Create file upload endpoint
   - Integrate with existing Claude AI service
   - Build form mapping logic
   - Create audit logging
   - Develop UI component
   - Add security validations
   - Write tests

3. **Build Foundational Infrastructure**:
   - Create database migration scripts
   - Set up file upload infrastructure (R2 signed URLs)
   - Configure encryption for sensitive settings
   - Establish audit logging patterns
   - Create base service classes

4. **Establish Testing Patterns**:
   - Set up Jest/Vitest for unit tests
   - Configure Playwright for E2E
   - Create factory patterns for test data
   - Implement mock services for external dependencies

5. **Create Documentation**:
   - API documentation for new endpoints
   - User guides for new features
   - Admin configuration guides
   - Security and compliance documentation

## CONCLUSION

The SelectSys Jobs codebase has a solid foundation but is missing the actual value-delivering features that would make it a compelling SaaS for multiple dekassegui recruitment agencies. By implementing the features specified above - particularly the resume import, dashboard metrics, integration hub, workflow builder, marketplace, certification program, and enhanced candidate portal - Gemini can transform this from a basic framework into a platform that naturally attracts and retains multiple paying agencies through genuine business value, not just technical features.

The key to success is implementing these features with the same security-first, compliance-focused, and multi-tenant mindset that was baked into the original architecture - ensuring that every new feature enhances rather than compromises the core value propositions of operational fidelity, LGPD compliance, and dekassegui-specific functionality.