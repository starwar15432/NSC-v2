require('global');
require('prototype.creepSpeech')();
const roleUpgrader = require ('role.upgrader');

module.exports = {
    run: function (room, creep) {
        creep.say('miner;');
        //changes state
        if (creep.memory.w == true && _.sum(creep.carry) == 0) {
            creep.memory.w = false;
        }
        else if (creep.memory.w == false && _.sum(creep.carry) >= creep.carryCapacity) {
            creep.memory.w = true;
        }

        // if working if true do stuff or else mine
        if (creep.memory.w == true) {

            //if container found put transfer energy to container if container full drop energy

            var container = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
                && _.sum(s.store) < s.storeCapacity
            })[0];

            if (container) {
                creep.creepSpeech(room, 'droppingEnergyContainer');
                for (let resourceType in creep.carry) {
                    creep.transfer(container, resourceType);
                }
            }
            else {
                creep.creepSpeech(room, 'droppingEnergy');
                for (let resourceType in creep.carry) {
                    creep.drop(resourceType);
                }
            }
        }
        else {

            var extractor = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_EXTRACTOR})[0];
            if (extractor) {
                var mineral = global[room.name].mineral;
                if (!mineral.ticksToLive) {
                    if (creep.harvest(mineral) != OK) {
                        creep.moveTo(mineral);
                    }
                }
                else roleUpgrader.run(room, creep);
            }

        }
    }
};