require('global');
require('prototype.creepSpeech')();

var type2 = require ('role.type2');

module.exports = {
    run: function(creep) {

        if (creep.memory.w == true && creep.carry.energy == 0) {
            creep.memory.w = false;
        }
        else if (creep.memory.w == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.w = true;
        }

        if (creep.memory.w == true) {
            var structure = creep.pos.findClosestByRange(FIND_STRUCTURES,
                {filter: (s) => (((s.structureType == STRUCTURE_RAMPART && s.hits <= 30000)
                || (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART)))});

            if (structure) {
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            else {
                type2.run(creep);
            }
        }
        else {

            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (source) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source)
                }
            }
        }
    }
};