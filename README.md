# Project Cargo Desk

A local demo of a project-cargo inquiry and quotation desk, prepared for Interfreight Group. It was built by CasinWorks (Christian Joshua Casin).

The jobs, companies, prices, and staff names in the app are fictional. It is not Interfreight’s live system.

## Run it on your computer

You need [Node.js 20.9 or newer](https://nodejs.org).

### Mac

1. Open Terminal.
2. Go into this folder. Example: `cd ~/Downloads/project-cargo-desk`
3. Run `npm install`
4. Run `npm run dev`
5. Open [http://localhost:3847](http://localhost:3847)

### Windows

1. Open Command Prompt or PowerShell.
2. Go into this folder. Example: `cd %USERPROFILE%\Downloads\project-cargo-desk`
3. Run `npm install`
4. Run `npm run dev`
5. Open [http://localhost:3847](http://localhost:3847)

Leave that window open while you use the app. Stop it with Ctrl+C.

## What you will see

The app opens on the team desk. Sample inquiries are marked SAMPLE. Use **View as Customer** to send an inquiry, then switch back. The new inquiry is in the same browser.

**Help** in the header starts a short tour, opens the handbook (large slides), or opens the written guide. Arrow keys move a tour or the handbook. Escape closes a tour.

Data stays in this browser only. It is not a shared server. **Reset demo data** in the footer puts the samples back.

`npm run seed` checks that the sample file is intact. It does not import a database. `npm test` checks the CBM, freight-ton, and limit calculations.

## What is not real

Prices are sample figures typed by hand. Limit checks are indicative only. There is no vessel schedule, no automatic price, no duty calculation, and no permit filing.
