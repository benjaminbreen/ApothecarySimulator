// GameModals.jsx
// Container component for all game modals and popups

import React, { Suspense } from 'react';
import JournalPanelEnhanced from '../../features/inventory/components/JournalPanelEnhanced';
import MixingWorkshop from '../../components/MixingWorkshop';
import MedicalRecordsManager from '../../core/systems/medicalRecordsManager';
import { getListTypeById } from '../../core/config/listTypes.config'; // For auto-list on fast travel


import ItemModalEnhanced from '../../features/inventory/components/ItemModalEnhanced';
import EquipmentModal from '../../features/inventory/components/EquipmentModal.jsx';
import ReputationModal from '../../components/ReputationModal';
import SkillsModal from '../../components/SkillsModal';
import SkillsDetailModal from '../../components/SkillsDetailModal';
import PrescribePopup from '../../features/medical/components/PrescribePopup.jsx';
import SimplePrescribeModal from '../../features/medical/components/SimplePrescribeModal';
import NPCPatientModal from '../../features/medical/components/NPCPatientModal';
import NPCModal from '../../features/modals/NPCModal';


import TradeModal from '../../features/commerce/components/TradeModal';
import LedgerModal from '../../features/commerce/components/LedgerModal';
import OfferItemModal from '../../features/commerce/components/OfferItemModal';
import FastTravelModal from '../../features/travel/components/FastTravelModal';
import BloodlettingModal from '../../features/medical/components/BloodlettingModal';
import { EndGamePopup } from '../../shared/components/EndGameAssessment';
import About from '../../shared/components/About';
import Map from '../../features/narrative/components/Map';
import Sleep from '../../features/character/components/Sleep';
import RestDurationModal from '../../features/character/components/RestDurationModal';
import PatientRosterModal from '../../features/medical/components/PatientRosterModal';
import EatAction from '../../components/EatAction';
import ForageAction from '../../features/foraging/ForageAction';
import GameLog from '../../components/GameLog';
import SettingsModal from '../../components/SettingsModal_V3';
import HelpModal from '../../components/HelpModal';
import InteractiveMapModal from '../../features/map/components/InteractiveMapModal';
import POIModal from '../../components/POIModal';
import imageMap from '../../imageMap';
import { scenarioLoader } from '../../core/services/scenarioLoader';

// Lazy load PDFPopup (heavy component)
const PDFPopup = React.lazy(() => import('../../shared/components/PDFPopup'));

export function GameModals({
  // Modal states
  showMixingPopup,
  isPrescribePopupOpen,
  isSimplePrescribeOpen,
  isSleepOpen,
  isRestDurationOpen,
  isMapOpen,
  isInteractiveMapModalOpen,
  isInventoryOpen,
  isJournalOpen,
  isAboutOpen,
  showPatientModal,
  showNPCModal,
  showItemModal,
  showEquipmentModal,
  showReputationModal,
  reputationModalFaction,
  showSkillsModal,
  detailSkillId,
  showPOIModal,
  isSettingsOpen,
  isHelpOpen,
  isPdfOpen,
  showEndGamePopup,
  isEatOpen,
  isForageOpen,
  isGameLogOpen,
  isModernInventoryOpen,
  isDiagnoseOpen,
  isBuyOpen,
  isOfferOpen,
  isLedgerOpen,
  isFastTravelOpen,
  isBloodlettingOpen,
  isPatientRosterOpen,

  // Modal data
  offerRecipient,
  simplePrescribeRecipient,
  tradeMode,
  tradingNPC,
  inventoryViewMode,
  preselectedTradeTab, // Optional tab to preselect in TradeModal
  selectedPatient,
  selectedNPC,
  selectedItem,
  selectedPOIEntity,
  selectedPDF,
  selectedCitation,
  journal,
  customJournalEntry,
  gameState,
  currentPatient,
  conversationHistory,
  turnNumber,
  currentWealth,
  gameAssessment,
  currentPrescriptionType,
  energy,
  health,
  isPrescribing,
  reputation,
  playerSkills,
  skillEffects,
  transactionManager,
  TRANSACTION_CATEGORIES,
  playerPosition,
  currentMapId,

  // Toggle/close handlers
  toggleMixingPopup,
  setIsPrescribePopupOpen,
  setIsSimplePrescribeOpen,
  setIsSleepOpen,
  setIsRestDurationOpen,
  sleepHours,
  setSleepHours,
  toggleMap,
  setIsInteractiveMapModalOpen,
  toggleInventory,
  toggleJournal,
  toggleAbout,
  setShowPatientModal,
  setSelectedPatient,
  setShowNPCModal,
  setSelectedNPC,
  setShowItemModal,
  setSelectedItem,
  setShowEquipmentModal,
  setShowReputationModal,
  setShowSkillsModal,
  setDetailSkillId,
  setShowPOIModal,
  setSelectedPOIEntity,
  setIsSettingsOpen,
  setIsHelpOpen,
  closePdfPopup,
  setShowEndGamePopup,
  setIsEatOpen,
  setIsForageOpen,
  setIsGameLogOpen,
  setIsModernInventoryOpen,
  toggleDiagnose,
  setIsBuyOpen,
  setIsOfferOpen,
  setIsLedgerOpen,
  setIsFastTravelOpen,
  setIsBloodlettingOpen,
  setIsPatientRosterOpen,
  setJournal,

  // Callbacks and state setters
  addJournalEntry,
  addCompoundToInventory,
  updateInventory,
  advanceTime,
  handleJournalEntrySubmit,
  setCustomJournalEntry,
  handlePDFClick,
  refreshInventory,
  setHistoryOutput,
  setConversationHistory,
  setTurnNumber,
  setIsLoading,
  handleEat,
  handleForageComplete,
  applyResourceChanges,
  setCurrentPatient,
  setCurrentPrescriptionType,
  setIsPrescribing,
  setIsInventoryOpen,
  setNPCPosition,
  setCurrentMapId, // For fast travel map changes
  npcPositions,
  recentNPCs, // Filtered list of NPCs mentioned in narrative
  handleWealthChange,
  historyOutput,
  awardXP,
  awardSkillXP,
  learnNewSkill,
  improveSkill,
  setGameState,
  handleListRequest, // Auto-list for modal-based fast travel

  // Portrait and scenario
  portraitImage, // Maria's dynamically computed portrait
  scenarioId,
  primaryPortraitFile, // PHASE 1: LLM-selected portrait

  // Tab control (for dev panel)
  setActiveTab,
  setActivePatient,
  setPatientDialogue,

  // Furniture click handler from map
  handleFurnitureClick,

  // Prescription outcome handlers
  onPrescriptionPending, // NEW: Handler for prescription outcome data (for "More Info" button)

  // Weather background toggle
  weatherBackgroundEnabled,
  setWeatherBackgroundEnabled,
}) {
  // Local state for ItemModalEnhanced initial tab
  const [itemModalInitialTab, setItemModalInitialTab] = React.useState('overview');

  return (
    <>
      {/* Mixing Workshop Modal */}
      <MixingWorkshop
        isOpen={showMixingPopup}
        onClose={toggleMixingPopup}
        simples={gameState.inventory}
        addCompoundToInventory={addCompoundToInventory}
        updateInventory={updateInventory}
        addJournalEntry={addJournalEntry}
        unlockedMethods={gameState.unlockedMethods}
        advanceTime={advanceTime}
        awardXP={awardXP}
        awardSkillXP={awardSkillXP}
        gameState={gameState}
        onItemClick={(item, tab = 'properties') => {
          setSelectedItem(item);
          setItemModalInitialTab(tab);
          setShowItemModal(true);
        }}
      />

    

      {/* Prescribe Popup */}
      <PrescribePopup
        isOpen={isPrescribePopupOpen}
        onClose={() => {
          setIsPrescribePopupOpen(false);
          setCurrentPrescriptionType(null);
          setIsPrescribing(false);
          setIsInventoryOpen(false);

          // Reset NPC status to idle when closing prescription popup
          if (currentPatient) {
            const npcId = currentPatient.id || currentPatient.name;
            const npc = npcPositions.find(n => n.npcId === npcId);
            if (npc) {
              setNPCPosition(npc.npcId, npc.npcName, npc.position, 'idle');
            }
          }

          setCurrentPatient(null);
        }}
        currentPatient={currentPatient}
        gameState={gameState}
        updateInventory={updateInventory}
        addCompoundToInventory={addCompoundToInventory}
        conversationHistory={conversationHistory}
        setHistoryOutput={setHistoryOutput}
        setConversationHistory={setConversationHistory}
        setTurnNumber={setTurnNumber}
        toggleInventory={toggleInventory}
        setIsLoading={setIsLoading}
        addJournalEntry={addJournalEntry}
        currentWealth={currentWealth}
        prescriptionType={currentPrescriptionType}
        advanceTime={advanceTime}
        imageMap={imageMap}
        playerSkills={playerSkills}
        transactionManager={transactionManager}
        TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
        awardXP={awardXP}
        awardSkillXP={awardSkillXP}
        onPrescriptionPending={onPrescriptionPending}
        onPrescriptionComplete={(prescriptionData) => {
          // Add medical record when prescription is completed
          if (currentPatient && gameState) {
            const updatedRecords = MedicalRecordsManager.addSession(
              gameState.medicalRecords || {},
              currentPatient,
              {
                date: gameState.date,
                turnNumber: turnNumber,
                qaExchanges: [], // Q&A system to be implemented
                symptoms: currentPatient.symptoms || [],
                diagnosis: currentPatient.diagnosis || '',
                prescriptions: [{
                  medicine: prescriptionData.itemName,
                  route: prescriptionData.route,
                  dosage: prescriptionData.amount,
                  price: prescriptionData.price
                }],
                outcome: 'Prescribed' // Will be updated when treatment outcome is known
              }
            );

            setGameState(prevState => ({
              ...prevState,
              medicalRecords: updatedRecords
            }));

            console.log('[Medical Records] Added prescription record for', currentPatient.name);
          }
        }}
      />

      {/* Simple Prescribe Modal - Quick dispensing without full patient examination */}
      {isSimplePrescribeOpen && simplePrescribeRecipient && (
        <SimplePrescribeModal
          isOpen={isSimplePrescribeOpen}
          onClose={() => {
            setIsSimplePrescribeOpen(false);
            toggleInventory(false);
          }}
          gameState={gameState}
          updateInventory={updateInventory}
          currentWealth={currentWealth}
          handleWealthChange={handleWealthChange}
          recipientName={simplePrescribeRecipient}
          onPrescribeComplete={(prescriptionData) => {
            console.log('[SimplePrescribeComplete]', prescriptionData);
            // Trigger a narrative turn with the prescription result
            const prescribeText = `You dispense ${prescriptionData.amount}× ${prescriptionData.item.name} (${prescriptionData.route}) to ${prescriptionData.recipientName} for ${prescriptionData.price} reales.`;

            // Add to conversation history
            setConversationHistory(prev => [
              ...prev,
              { role: 'user', content: `Prescribe ${prescriptionData.item.name} to ${prescriptionData.recipientName}` },
              { role: 'assistant', content: prescribeText }
            ]);

            setHistoryOutput(prescribeText);
            setTurnNumber(t => t + 1);
          }}
          toggleInventory={toggleInventory}
        />
      )}

      {/* About Modal */}
      {isAboutOpen && <About isOpen={isAboutOpen} toggleAbout={toggleAbout} />}

      {/* Journal (Slide-in Enhanced) */}
      <JournalPanelEnhanced
        isOpen={isJournalOpen}
        onClose={toggleJournal}
        journal={journal}
        onAddEntry={(entry) => {
          // Directly add the full entry object with all metadata
          if (setJournal) {
            setJournal(prevJournal => [...prevJournal, entry]);
          }
        }}
        currentTime={gameState.time}
        currentDate={gameState.date}
        currentLocation={gameState.location}
        currentWeather={gameState.weather || 'Clear'}
        reputation={reputation}
      />

      {/* Rest Duration Modal - Choose sleep duration */}
      <RestDurationModal
        isOpen={isRestDurationOpen}
        onClose={() => setIsRestDurationOpen(false)}
        currentEnergy={energy}
        currentHealth={health}
        onSelectDuration={(selection) => {
          setSleepHours(selection.hours);
          setIsRestDurationOpen(false);
          setIsSleepOpen(true);
        }}
      />

      {/* Sleep Modal */}
      <Sleep
        isOpen={isSleepOpen}
        onClose={() => setIsSleepOpen(false)}
        gameState={gameState}
        conversationHistory={conversationHistory}
        handleTurnEnd={() => setTurnNumber(t => t + 1)}
        addJournalEntry={addJournalEntry}
        setHistoryOutput={setHistoryOutput}
        setConversationHistory={setConversationHistory}
        setTurnNumber={setTurnNumber}
        advanceTime={advanceTime}
        currentEnergy={energy}
        currentHealth={health}
        applyResourceChanges={applyResourceChanges}
        sleepHours={sleepHours}
        awardXP={awardXP}
      />

      {/* Map Modal */}
      {isMapOpen && (
        <Map
          isOpen={isMapOpen}
          onClose={toggleMap}
        />
      )}

      {/* Trade Modal (NEW) */}
      {isBuyOpen && (
        <TradeModal
          isOpen={isBuyOpen}
          onClose={() => {
            setIsBuyOpen(false);
            toggleInventory(false);
          }}
          gameState={gameState}
          updateInventory={updateInventory}
          setHistoryOutput={setHistoryOutput}
          currentWealth={currentWealth}
          handleWealthChange={handleWealthChange}
          addJournalEntry={addJournalEntry}
          conversationHistory={conversationHistory}
          setIsLoading={setIsLoading}
          handleTurnEnd={() => setTurnNumber(t => t + 1)}
          reputation={reputation}
          transactionManager={transactionManager}
          TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
          playerSkills={playerSkills}
          awardXP={awardXP}
          awardSkillXP={awardSkillXP}
          mode={tradeMode}
          tradingNPC={tradingNPC}
          initialViewMode={inventoryViewMode}
          preselectedTab={preselectedTradeTab}
          activeInvestments={gameState.investments?.active || []}
          setActiveInvestments={(newInvestments) => {
            setGameState(prev => ({
              ...prev,
              investments: {
                ...prev.investments,
                active: newInvestments
              }
            }));
          }}
        />
      )}

      {/* Offer Item Modal */}
      {isOfferOpen && offerRecipient && (
        <OfferItemModal
          isOpen={isOfferOpen}
          onClose={() => {
            setIsOfferOpen(false);
            toggleInventory(false);
          }}
          gameState={gameState}
          updateInventory={updateInventory}
          currentWealth={currentWealth}
          handleWealthChange={handleWealthChange}
          recipientName={offerRecipient.name}
          onOfferComplete={(offerData) => {
            console.log('[OfferComplete]', offerData);
            // Trigger a narrative turn with the offer result
            const offerText = offerData.isGift
              ? `I offer ${offerData.amount}× ${offerData.item.name} as a gift to ${offerData.recipientName}`
              : `I offer to sell ${offerData.amount}× ${offerData.item.name} to ${offerData.recipientName} for ${offerData.price} reales`;

            // Add to conversation history
            setConversationHistory(prev => [
              ...prev,
              { role: 'user', content: offerText },
            ]);

            setHistoryOutput(offerText);
            setTurnNumber(t => t + 1);
          }}
          toggleInventory={toggleInventory}
        />
      )}

      {/* Diagnose Modal */}
      {isDiagnoseOpen && (
        <Diagnose
          isOpen={isDiagnoseOpen}
          onClose={toggleDiagnose}
          patient={currentPatient}
          previousOutput={historyOutput}
          theme="light"
        />
      )}

      {/* Eat Action Modal */}
      <EatAction
        isOpen={isEatOpen}
        onClose={() => setIsEatOpen(false)}
        currentWealth={currentWealth}
        currentEnergy={energy}
        currentHealth={health}
        onEat={handleEat}
        transactionManager={transactionManager}
        TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
        gameState={gameState}
      />

      {/* Forage Action Modal */}
      <ForageAction
        isOpen={isForageOpen}
        onClose={() => setIsForageOpen(false)}
        currentLocation={gameState.location}
        gameState={{ energy, location: gameState.location }}
        scenario={scenarioLoader.getScenario(scenarioId || '1680-mexico-city')}
        onForageComplete={handleForageComplete}
      />

      {/* Game Log Modal */}
      <GameLog
        isOpen={isGameLogOpen}
        onClose={() => setIsGameLogOpen(false)}
        conversationHistory={conversationHistory}
        turnNumber={turnNumber}
      />

    

      {/* PDF Popup (Lazy loaded) */}
      {isPdfOpen && (
        <Suspense fallback={<div>Loading PDF...</div>}>
          <PDFPopup
            isOpen={isPdfOpen}
            onClose={closePdfPopup}
            pdfPath={selectedPDF}
            citation={selectedCitation}
          />
        </Suspense>
      )}

      {/* End Game Popup */}
      {showEndGamePopup && (
        <EndGamePopup
          assessment={gameAssessment}
          onClose={() => setShowEndGamePopup(false)}
          gameData={{
            turnNumber,
            wealth: currentWealth,
            health,
            energy,
            reputation,
            inventory: gameState.inventory,
            journal,
            conversationHistory,
            endQuestResult: gameState.endQuestResult,
            scenarioId: gameState.scenarioId,
            playerSkills,
            profession: gameState.profession,
            relationships: gameState.relationships,
          }}
        />
      )}

      {/* Patient Roster Modal */}
      <PatientRosterModal
        isOpen={isPatientRosterOpen}
        onClose={() => setIsPatientRosterOpen(false)}
        onSelectPatient={(patient) => {
          console.log('[Patient Roster] Patient selected:', patient.name);
          setSelectedPatient(patient);
          setShowPatientModal(true);
          setIsPatientRosterOpen(false);
        }}
        medicalRecords={gameState?.medicalRecords || {}}
      />

      {/* NPC Patient Modal */}
      <NPCPatientModal
        isOpen={showPatientModal}
        onClose={() => {
          setShowPatientModal(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onPrescribe={(patient) => {
          console.log('[Patient Modal] Prescribe clicked for:', patient.name);
          setCurrentPatient(patient);
          setIsPrescribePopupOpen(true);
        }}
        onDiagnose={(patient) => {
          console.log('[Patient Modal] Diagnose clicked for:', patient.name);
          setCurrentPatient(patient);
          toggleDiagnose();
        }}
        medicalRecords={gameState?.medicalRecords || {}}
        playerSkills={playerSkills}
        reputation={reputation}
        currentDate={gameState?.date}
        currentTime={gameState?.time}
      />

      {/* NPC Modal (for non-patient NPCs) */}
      <NPCModal
        isOpen={showNPCModal}
        onClose={() => {
          setShowNPCModal(false);
          setSelectedNPC(null);
        }}
        npc={selectedNPC}
        primaryPortraitFile={primaryPortraitFile}
        conversationHistory={conversationHistory}
      />

      {/* Item Modal Enhanced */}
      <ItemModalEnhanced
        isOpen={showItemModal}
        onClose={() => {
          setShowItemModal(false);
          setSelectedItem(null);
          setItemModalInitialTab('overview'); // Reset to default tab
        }}
        item={selectedItem}
        initialTab={itemModalInitialTab}
        onOpenLedger={() => setIsLedgerOpen(true)}
        inventory={gameState?.inventory || []}
        onSelectItem={setSelectedItem}
      />

      {/* Equipment Modal */}
      <EquipmentModal
        isOpen={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        inventory={gameState.inventory}
        characterName="Maria de Lima"
        portraitImage={portraitImage}
        health={health}
        energy={energy}
        wealth={currentWealth}
        theme="light"
      />

      {/* Reputation Modal */}
      <ReputationModal
        isOpen={showReputationModal}
        onClose={() => setShowReputationModal(false)}
        reputation={reputation}
        initialFaction={reputationModalFaction}
        initialTab={reputationModalFaction ? 'factions' : 'overview'}
      />

      {/* Skills Modal */}
      <SkillsModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        playerSkills={playerSkills}
        onLearnSkill={learnNewSkill}
        onLevelUpSkill={improveSkill}
        onOpenSkillDetail={(skillId) => setDetailSkillId(skillId)}
      />

      {/* Skills Detail Modal - Rendered at top level */}
      {detailSkillId && (
        <SkillsDetailModal
          isOpen={!!detailSkillId}
          onClose={() => setDetailSkillId(null)}
          skillId={detailSkillId}
          currentLevel={playerSkills?.knownSkills?.[detailSkillId]?.level || 0}
          currentXp={playerSkills?.knownSkills?.[detailSkillId]?.xp || 0}
          onNavigate={(newSkillId) => setDetailSkillId(newSkillId)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scenario={scenarioLoader.getScenario(scenarioId || '1680-mexico-city')}
        gameState={gameState}
        setGameState={setGameState}
        health={health}
        energy={energy}
        weatherBackgroundEnabled={weatherBackgroundEnabled}
        setWeatherBackgroundEnabled={setWeatherBackgroundEnabled}
        onLoadTestPatient={(patient) => {
          setActivePatient(patient);
          setActiveTab('patient');
        }}
        onLoadPrescriptionTest={(patient) => {
          setActivePatient(patient);
          setActiveTab('patient');
          // Simulate that the patient has already answered a question
          // This triggers the prescription banner to appear
          setPatientDialogue([
            {
              question: 'What troubles you?',
              answer: patient.symptoms && patient.symptoms.length > 0
                ? patient.symptoms.map(s => s.description).join('. ')
                : 'I have been feeling unwell with melancholy and fatigue.',
              timestamp: new Date().toISOString()
            }
          ]);
        }}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Interactive Map Modal */}
      {isInteractiveMapModalOpen && (
        <InteractiveMapModal
          isOpen={isInteractiveMapModalOpen}
          onClose={() => setIsInteractiveMapModalOpen(false)}
          scenario={scenarioLoader.getScenario(scenarioId || '1680-mexico-city')}
          currentLocation={gameState.location}
          currentMapId={currentMapId}
          npcs={recentNPCs}
          playerPosition={playerPosition}
          onLocationChange={(newLocation) => {
            // TODO: Wire up location change handler from GamePage
            console.log('Location changed via map modal:', newLocation);
          }}
          onFurnitureClick={handleFurnitureClick}
          theme="light"
        />
      )}

      {/* Ledger Modal */}
      {isLedgerOpen && (
        <LedgerModal
          isOpen={isLedgerOpen}
          onClose={() => setIsLedgerOpen(false)}
          playerSkills={playerSkills}
          currentWealth={currentWealth}
          gameState={gameState}
          transactionManager={transactionManager}
          TRANSACTION_CATEGORIES={TRANSACTION_CATEGORIES}
          theme="light"
        />
      )}

      {/* Fast Travel Modal */}
      {isFastTravelOpen && (
        <FastTravelModal
          isOpen={isFastTravelOpen}
          onClose={() => setIsFastTravelOpen(false)}
          playerSkills={playerSkills}
          currentLocation={gameState.location}
          currentWealth={currentWealth}
          currentEnergy={energy}
          onTravel={({ destination, energyCost, travelTime, wealthCost = 0, mapId }) => {
            // Update location
            updateLocation(destination);

            // Change map if mapId is provided
            if (mapId && setCurrentMapId) {
              setCurrentMapId(mapId);
              console.log('[FastTravel] Changed map to:', mapId);
            }

            // Deduct energy
            applyResourceChanges('travel', {
              energyBonus: -energyCost
            });

            // Deduct wealth if needed (paid transport)
            if (wealthCost > 0) {
              const newWealth = currentWealth - wealthCost;
              handleWealthChange(newWealth);

              // Log transaction
              if (transactionManager) {
                transactionManager.logTransaction(
                  'expense',
                  TRANSACTION_CATEGORIES.TRAVEL,
                  `Travel to ${destination}`,
                  wealthCost,
                  newWealth,
                  gameState.date,
                  gameState.time
                );
              }
            }

            // Advance time
            advanceTime({ time: gameState.time, date: gameState.date }, travelTime);

            // Add journal entry
            addJournalEntry({
              turnNumber,
              date: gameState.date,
              entry: `Traveled to ${destination}. Journey took ${travelTime} minutes.${wealthCost > 0 ? ` Cost: ${wealthCost} reales.` : ''}`
            });

            // Update conversation
            const travelMessage = `*Maria traveled to ${destination}. The journey was ${energyCost < 20 ? 'short' : energyCost < 40 ? 'moderate' : 'arduous'}.${wealthCost > 0 ? ` Cost: ${wealthCost} reales.` : ''}*`;
            setConversationHistory(prev => [...prev, { role: 'system', content: travelMessage }]);

            setIsFastTravelOpen(false);

            // AUTO-GENERATE "People present" list after modal-based fast travel
            // Matches command-based fast travel behavior for consistency
            if (handleListRequest) {
              const peopleListType = getListTypeById('people');
              if (peopleListType) {
                console.log('[FastTravelModal] Auto-generating people list at destination:', destination);
                // Small delay ensures travel message renders first
                setTimeout(() => {
                  handleListRequest(peopleListType, true); // isAutoGenerated = true (hides user prompt)
                }, 100);
              }
            }
          }}
        />
      )}

      {/* Bloodletting Modal */}
      {isBloodlettingOpen && (
        <BloodlettingModal
          isOpen={isBloodlettingOpen}
          onClose={() => setIsBloodlettingOpen(false)}
          playerSkills={playerSkills}
          currentPatient={currentPatient || activePatient}
          gameState={gameState}
          onBloodlettingComplete={(result) => {
            // Add journal entry
            addJournalEntry({
              turnNumber,
              date: gameState.date,
              entry: `Performed phlebotomy on ${result.patientName}. Vein: ${result.vein}. Blood drawn: ${result.bloodAmount} fl oz. ${result.success ? 'Procedure successful.' : 'Complications occurred.'}`
            });

            // Award XP for surgery (+1 XP)
            if (awardXP) {
              awardXP(1, `surgery_bloodletting_${result.patientName}`);
            }

            // Award skill XP
            awardSkillXP('anatomy', result.success ? 10 : 5);

            // Advance time (bloodletting takes ~30 minutes)
            advanceTime({ time: gameState.time, date: gameState.date }, 30);

            // Update conversation
            const bloodlettingMessage = `*Maria performed phlebotomy. ${result.narrative}*`;
            setConversationHistory(prev => [...prev, { role: 'system', content: bloodlettingMessage }]);

            setIsBloodlettingOpen(false);
          }}
        />
      )}

      {/* POI Modal - for furniture and entity details */}
      {showPOIModal && (
        <POIModal
          isOpen={showPOIModal}
          onClose={() => {
            setShowPOIModal(false);
            setSelectedPOIEntity(null);
          }}
          entity={selectedPOIEntity}
          inventory={gameState?.inventory || []}
          onInventoryUpdate={(itemName, quantityChange) => {
            // Update inventory quantity
            updateInventory(itemName, quantityChange);
          }}
        />
      )}
    </>
  );
}
