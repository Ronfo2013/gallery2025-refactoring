# Terms of Service – Gallery2025 Multi-Brand SaaS

**Effective Date:** 27 Novembre 2025

1. **Service Scope**  
   Gallery2025 fornisce una piattaforma per creare e gestire gallerie fotografiche multi-brand, inclusi landing page pubblici, dashboard superuser e SuperAdmin, con storage isolato per brand.

2. **Access & Credentials**  
   L’accesso è garantito tramite account Firebase Auth. SuperAdmin gestisce credenziali e può resettare password. I brand owner ricevono il link `https://gallery-app-972f9.web.app/{brand-slug}/#/dashboard`.

3. **User Responsibilities**

- Mantieni credenziali private.
- Rispetta le leggi sul copyright per le foto caricate.
- Segnala anomalie al supporto (`support@gallery2025.com`).

4. **Billing & Subscriptions**  
   Stripe gestisce pagamenti e recurring. L’abbonamento viene attivato solo dopo il checkout completato; annullamente automatico e proroghe seguono i webhook stripe geolocalizzati (europe-west1).

5. **Data & Termination**  
   In caso di cancellazione del brand, i dati Firestore/Storage possono essere eliminati entro 30 giorni. Il SuperAdmin può sospendere o eliminare un brand per violazioni.

6. **Changes**  
   Aggiornamenti a questi termini saranno pubblicati su `docs/TERMS_OF_SERVICE.md`; l’uso continuato implica l’accettazione.
