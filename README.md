# Health In Climate AI Hackathon
# Aegis AI

## Problem & Users
Heat stress poses a significant human and financial burden in the United States, contributing to hundreds of worker deaths and over **$1 billion in annual medical costs**. Current safety practices are largely **reactive and compliance-driven**, relying on generic checklists and weather alerts without incorporating **real-time health monitoring**. This leaves workers vulnerable to heat exhaustion and stroke while also creating major inefficiencies for employers.  

For example, unmanaged heat stress leads to **productivity losses in the construction industry ranging from 29% to 41%**, highlighting the urgent need for a preventative, data-driven solution.  

---

## Data Sources
- [Heat stress impacts workers and the bottom line | Harvard T.H. Chan School of Public Health](https://www.hsph.harvard.edu/)  
- [WHO/WMO Guidance to Protect Workers from Increasing Heat Stress](https://www.who.int/news/item/22-08-2025-who-wmo-issue-new-report-and-guidance-to-protect-workers-from-increasing-heat-stress)  
- [Occupational Heat Stress and Kidney Health: From Farms to Factories - PMC](https://www.ncbi.nlm.nih.gov/pmc/)  
- [IEEE DataPort: Forecasting Thermal Comfort Sensations for Heatstroke Prevention](https://ieee-dataport.org/)  

---

## Model / Approach
Aegis integrates **physiological and environmental data** to deliver predictive insights into worker heat risk.  

- **Datasets:** Public IEEE dataset on thermal comfort (age, gender, body temperature, HRV) + real-time weather APIs (humidity, heat index, air quality).  
- **Guidelines:** Thresholds based on **OSHA heat safety standards**.  
- **Wearable Integration:** A smart device collects biodata, generating individualized **Heat Risk Scores**.  
- **Alerts:**  
  - **Yellow Alert** → Caution, worker advised to slow down.  
  - **Red Alert** → Immediate stop, hydration required.  
- **Dashboard:** Aggregates data for compliance reporting, shift scheduling, and liability reduction.  

This combined approach ensures proactive interventions, preventing heat exhaustion and stroke before they occur.  

---

## Deployment Plan
- **Backend:** Hosted on AWS EC2, running a Flask web server with Python 3.  
- **Frontend:** Deployed via Vercel, built with **Next.js, React, Tailwind CSS, and TypeScript**.  
- **Machine Learning Model:** Random Forest (XGBoost), optimized for accuracy in predicting individual worker safety risks.  

---

## Impact Metrics
- **Productivity Boost:** Downtime hours prevented through proactive risk alerts.  
- **Reduced Costs:** Fewer workers’ compensation claims and insurance payouts.  
- **Lives Saved:** Predicted fatalities and emergency department visits averted.  

---

## Data Governance
Aegis is built with **privacy, fairness, and compliance** at its core:  

- **De-Identification:** All worker data anonymized before analysis.  
- **PHI Handling:** HIPAA-aligned encryption, access controls, and retention policies.  
- **Licenses/ToS:** Strict adherence to partner data terms and usage rights.  
- **Model Card:** Transparent documentation of model purpose, assumptions, and limitations.  
- **Fairness Audits:** Regular bias checks across age, gender, and health baselines to ensure equity.  
- **Governance Reviews:** Periodic oversight to maintain privacy, legal compliance, and trust.  

---

## Summary
**Aegis** transforms workplace safety by shifting from reactive compliance to proactive prevention. By combining biodata, environmental monitoring, and machine learning, our system protects workers, reduces costs, and helps companies adapt to the growing challenge of climate-driven heat stress.  
