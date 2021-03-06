require('global');

module.exports = {
    run: function (room) {

        if (!global[room.name].linkQueue) {
            global[room.name].linkQueue = {};
        }
        if (!global['linkRole']) {
            global['linkRole'] = {};
        }

        var links = _.filter(global[room.name].links, (l) => l.cooldown == 0);

        if (links.length > 0) {

            for (let link of links) {
                var role = this.whatAmI(room, link);

                switch (role) {
                    case 'giver':
                        this.giverRun(room, link);
                        break;
                    case 'taker':
                        this.takerRun(room, link);
                        break;
                    default:
                        continue;
                }

            }

        }
    },

    whatAmI: function (room, link) {
        if (!link) return;

        if (!global['linkRole'][link.id]) {
            var role;
            var extensions = global[room.name].extensions;

            var closest = link.pos.findClosestByRange(extensions.concat([room.storage, room.controller, global[room.name].sources[0], global[room.name].sources[1]]));

            if (closest && link.pos.getRangeTo(closest) <= 2) {
                role = extensions.concat([room.storage, room.controller]).includes(closest) ? 'taker' : 'giver';
            }

            global['linkRole'][link.id] = role || 'giver'; //either taker or giver
            return role;
        }

        return global['linkRole'][link.id];
    },

    giverRun: function (room, link) {
        if (!link || link.energy < link.energyCapacity) return;

        var orderKey = Object.keys(global[room.name].linkQueue)[0];
        var order = global[room.name].linkQueue[orderKey];
        if (order) {
                link.transferEnergy(Game.getObjectById(orderKey), order.amount);
                delete global[room.name].linkQueue[orderKey];
        }
    },

    takerRun: function (room, link) {

        if (link) {
            if (link.energy < 100) {
                global[room.name].linkQueue[link.id] = new this.order(link.energyCapacity - link.energy);
            }
            else if (link.energy > link.energyCapacity * 0.75 && global[room.name].linkQueue[link.id]) {
                delete global[room.name].linkQueue[link.id];
            }
        }

    },

    order: function (amount) {
        this.amount = amount;
    }
};