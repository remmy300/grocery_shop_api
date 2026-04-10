import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const UsersPage = () => {
  // Sample users data
  const users = [
    {
      id: "#BA-9281",
      name: "Eleanor Herbosa",
      avatar: "",
      initials: "EH",
      email: "e.herbosa@archives.com",
      role: "Admin",
      roleColor: "bg-secondary-fixed text-on-secondary-fixed-variant",
      joinDate: "Oct 12, 2023",
    },
    {
      id: "#BA-8820",
      name: "Julian Moss",
      avatar: "",
      initials: "JM",
      email: "julian.moss@nature.net",
      role: "Customer",
      roleColor: "bg-surface-container-high text-on-surface-variant",
      joinDate: "Jan 05, 2024",
    },
    {
      id: "#BA-7741",
      name: "Clara Thorne",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCInOr7nOiP8cGma4LBe1ImcDqNctkybe7hDFOr79KoLFRU-fW719VW3wKoLvT9AtXI0qIBarfXtIEd2Vkqe258VGgrqcSPAqAg1XiRSfbj5aFBrGefrPenykkfXKrvXfUgWNntE3kd5pjmGqhcU4ZXgiKjCLaEbkZ1Ht6tktptbvzohExGcyol84X8Wqu7Bh4ahjWk7Agk5y6wsBxwgLJ9OYiaAkiLkgt79QyX3KqO5FVs206Qht0koZBN2moEWjhSZeJKyG_YGMY",
      email: "clara@botanical.io",
      role: "Customer",
      roleColor: "bg-surface-container-high text-on-surface-variant",
      joinDate: "Feb 28, 2024",
    },
    {
      id: "#BA-4412",
      name: "Marcus Aris",
      avatar: "",
      initials: "MA",
      email: "m.aris@archives.com",
      role: "Admin",
      roleColor: "bg-secondary-fixed text-on-secondary-fixed-variant",
      joinDate: "Mar 15, 2024",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-label text-secondary-foreground mb-4 uppercase tracking-widest">
            <span>Admin</span>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="text-foreground font-bold">User Management</span>
          </nav>
          <h2 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Curation of Members
          </h2>
          <p className="mt-2 text-secondary-foreground max-w-xl font-body">
            Oversee the Botanical Archivist community. Manage permissions, audit
            join dates, and maintain the integrity of our member registry.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button className="px-6 py-3 rounded-full bg-surface-container-high text-primary font-semibold flex items-center gap-2 hover:scale-95 transition-transform">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </Button>
          <Button className="px-8 py-3 rounded-full bg-linear-to-br from-tertiary to-tertiary-container text-on-tertiary font-bold flex items-center gap-2 shadow-sm hover:scale-95 transition-transform">
            <span className="material-symbols-outlined">person_add</span>
            Invite Member
          </Button>
        </div>
      </header>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className=" flex justify-center items-center p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">group</span>
              </div>
              <Badge className="bg-primary/10 text-primary text-xs font-bold px-2 py-1">
                +12%
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Total Community
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              1,284
            </p>
          </CardContent>
        </Card>
        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className=" flex justify-center items-center p-2 bg-green-500/10 rounded-lg text-green-600">
                <span className="material-symbols-outlined">
                  admin_panel_settings
                </span>
              </div>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Active Admins
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              14
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className=" flex justify-center items-center w-12 h-12 bg-green-500/10 rounded-lg text-green-600">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <Badge className="bg-green-500/10 text-green-600 text-xs font-bold px-2 py-1">
                New
              </Badge>
            </div>
            <h3 className="text-secondary-foreground text-xs font-label uppercase tracking-widest mb-1">
              Joined This Week
            </h3>
            <p className="text-3xl font-heading font-black text-foreground">
              42
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Search & Filter Bar */}
      <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary-foreground">
            search
          </span>
          <Input
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-body"
            placeholder="Search by name, email or ID..."
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none px-4 py-3 bg-surface-container-highest text-on-surface-variant rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>
            Filter
          </Button>
          <Button
            variant="outline"
            className="flex-1 md:flex-none px-4 py-3 bg-surface-container-highest text-on-surface-variant rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            Role: All
            <span className="material-symbols-outlined text-sm">
              expand_more
            </span>
          </Button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-container-low border-none">
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                User ID
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Name
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Email Address
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Role
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label">
                Join Date
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-secondary-foreground font-label text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="hover:bg-surface-container-low/50 transition-colors group"
              >
                <TableCell className="px-6 py-5 text-sm font-mono text-secondary">
                  {user.id}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        user.initials
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {user.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-sm text-secondary-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="px-6 py-5">
                  <Badge
                    className={`${user.roleColor} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter`}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-5 text-sm text-secondary-foreground font-body">
                  {user.joinDate}
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        edit
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
          <span className="text-xs text-secondary-foreground font-label">
            Showing 1 to 4 of 1,284 members
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined text-sm">
                first_page
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-30"
              disabled
            >
              <span className="material-symbols-outlined text-sm">
                chevron_left
              </span>
            </Button>
            <div className="flex gap-1">
              <Button className="w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-xs font-bold"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-xs font-bold"
              >
                3
              </Button>
              <span className="px-1 py-2 text-xs font-bold">...</span>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-lg hover:bg-surface-container-highest text-xs font-bold"
              >
                321
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-sm">
                last_page
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
