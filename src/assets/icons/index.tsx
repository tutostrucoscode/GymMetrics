import Menu from "./menu.svg?r";
import Google from "./goolge.svg?r";
import Dumbbell from "./dumbbell.svg?r";
import Utensils from "./utensils.svg?r";
import ChartBar from "./chartBar.svg?r";
import CalendarAlt from "./calendarAlt.svg?r";
import Weight from "./weight.svg?r";
import History from "./history.svg?r";
import ChevronRight from "./chevronRight.svg?r";
import Info from "./info.svg?r";
import PlusCircle from "./plusCircle.svg?r";
import Clipboard from "./clipboard.svg?r";
import MinusCircle from "./minusCircle.svg?r";
import ChevronDoubleDown from "./chevronDoubleDown.svg?r";
import ChevronDoubleUp from "./chevronDoubleUp.svg?r";
import Bike from "./bike.svg?r";
import Running from "./running.svg?r";
import Yoga from "./yoga.svg?r";

type SvgrIcon = React.FC<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;

/**
 * @param {string} [props.color="inherit"] Icon's color
 * @param {string} [props.fontSize="1em"] Icon's size
 * @param {string} [props.title] Icon's title for accesibility
 * @returns {SvgrIcon}
 */

const Ico = {
  Menu: Menu as SvgrIcon,
  Google: Google as SvgrIcon,
  Dumbbell: Dumbbell as SvgrIcon,
  Utensils: Utensils as SvgrIcon,
  ChartBar: ChartBar as SvgrIcon,
  CalendarAlt: CalendarAlt as SvgrIcon,
  Weight: Weight as SvgrIcon,
  History: History as SvgrIcon,
  ChevronRight: ChevronRight as SvgrIcon,
  Info: Info as SvgrIcon,
  PlusCircle: PlusCircle as SvgrIcon,
  Clipboard: Clipboard as SvgrIcon,
  MinusCircle: MinusCircle as SvgrIcon,
  ChevronDoubleDown: ChevronDoubleDown as SvgrIcon,
  ChevronDoubleUp: ChevronDoubleUp as SvgrIcon,
  Bike: Bike as SvgrIcon,
  Running: Running as SvgrIcon,
  Yoga: Yoga as SvgrIcon,
};

export type { SvgrIcon };
export { Ico };
