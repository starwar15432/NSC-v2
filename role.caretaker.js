require('global');
require('prototype.creep')();
require('prototype.creepSpeech')();

module.exports = {
    run: function (room, creep) {
        PathFinder.use(true);

        if (creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }


        if (creep.memory.working == true) {
            var structureToRepair = this.findStructureToRepair(room, creep);
            if (structureToRepair) {
                if (creep.repair(structureToRepair) == ERR_NOT_IN_RANGE) {
                    this.moveToWithCostMatrix(room, creep, structureToRepair);
                }
            }
            else {
                var structureToBuild = creep.pos.findClosestByRange(room.find(FIND_MY_CONSTRUCTION_SITES));
                if (structureToBuild) {
                    if (creep.build(structureToBuild) == ERR_NOT_IN_RANGE) {
                        this.moveToWithCostMatrix(room, creep, structureToBuild);
                    }
                }
                else {
                    var defenseToRepair = this.findDefence(room, creep);
                    if (defenseToRepair) {
                        if (creep.build(defenseToRepair) == ERR_NOT_IN_RANGE) {
                            this.moveToWithCostMatrix(room, creep, defenseToRepair);
                        }
                    }
                    else {
                        var towerToRefill = this.getTowerToRefill(room);
                        if (towerToRefill) {
                            if (creep.build(towerToRefill) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(towerToRefill, {reusePath: 10});
                            }
                        }
                    }
                }
            }

        }
        else {
            var droppedEnergy = creep.findDroppedEnergy(room);

            if (!droppedEnergy) {
                droppedEnergy = [];
            }

            if (droppedEnergy.amount == undefined || droppedEnergy.amount < 1010) {
                var links = _.filter(global[room.name].links, (l) => l.energy > 0);
                var storage = room.storage;

                var arrayOfBoth = links;
                arrayOfBoth.push(storage);

                var closer = creep.pos.findClosestByRange(arrayOfBoth);

                if (closer != storage) {
                    if (creep.withdraw(closer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closer, {reusePath: 10})
                    }
                }
                else if (storage && storage.store[RESOURCE_ENERGY] > 1000) {
                    if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage, {reusePath: 10})
                    }
                }
                else {
                    var container = creep.findContainer(room);
                    if (container) {
                        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container)
                        }
                    }
                    else {
                        if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(container)
                        }
                    }
                }
            }
            else {
                if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(droppedEnergy);
                }
            }
        }
    },

    findStructureToRepair: function (room, creep) {
        var structure = creep.memory.structureToRepair;

        if (structure) {
            if (!structure.hits < structure.hitsMax) {
                structure = creep.pos.findClosestByRange(room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
                    && s.hits < (s.hitsMax * 0.2)
                }));
            }
        }
        else {
            structure = creep.pos.findClosestByRange(room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
                && s.hits < (s.hitsMax * 0.2)
            }));
        }

        creep.memory.structureToRepair = structure;
        return structure;
    },

    findDefence: function (room, creep) {
        var minDefenceLevel = Memory.rooms[room].minDefenceLevel;
        if (!Memory.rooms[room].minDefenceLevel) {
            Memory.rooms[room].minDefenceLevel = 100000;
            minDefenceLevel = 100000;
        }

        var structures = room.find(FIND_STRUCTURES,
            {filter: (s) => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < minDefenceLevel});

        var structure = creep.pos.findClosestByRange(structures);

        if (!structure) {
            Memory.rooms[room].minDefenceLevel = minDefenceLevel + 10000;
            return;
        }

        return structure;
    },

    getTowerToRefill: function (room) {
        var towers = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity});

        if (towers.length > 0) {

            var tower = _.min(towers, 'energy');

            if (tower) {
                return tower;
            }
            else {
                return undefined;
            }

        }
        else {
            return undefined;
        }

    },

    moveToWithCostMatrix: function (room, creep, target) {
        creep.moveTo(target, {
            reusePath: 7, plainCost: 1, swampCost: 4,
            costCallback: function (roomName) {
                if (roomName == room.name) {
                    let room = Game.rooms[roomName];

                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;

                    room.find(FIND_STRUCTURES).forEach(function (structure) {
                        if (structure.structureType === STRUCTURE_ROAD) {
                            // Avoid Roads
                            costs.set(structure.pos.x, structure.pos.y, 5);
                        } else if (structure.structureType !== STRUCTURE_CONTAINER &&
                            (structure.structureType !== STRUCTURE_RAMPART || !structure.my)) {
                            // Can't walk through non-walkable buildings
                            costs.set(structure.pos.x, structure.pos.y, 0xff);
                        }
                    });

                    for (x = 0; x < 50; x++) {
                        costs.set(x, 49, 10);
                    }
                    for (x = 0; x < 50; x++) {
                        costs.set(x, 0, 10);
                    }
                    for (y = 0; y < 50; y++) {
                        costs.set(49, y, 10);
                    }
                    for (y = 0; y < 50; y++) {
                        costs.set(0, y, 10);
                    }

                    // Avoid creeps in the room
                    room.find(FIND_CREEPS).forEach(function (creep) {
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });

                    return costs;
                }
                else {
                    return;
                }
            },
        });
    }
};