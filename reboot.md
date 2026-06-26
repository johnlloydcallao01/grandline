[  OK  ] Created slice Slice /system/sshd-keygen.
[  OK  ] Created slice Slice /system/systemd-fsck.
[  OK  ] Created slice User and Session Slice.
[  OK  ] Started Dispatch Password Requests to Console Directory Watch.
[  OK  ] Started Forward Password Requests to Wall Directory Watch.
[  OK  ] Set up automount Arbitrary Executa…ormats File System Automount Point.
[  OK  ] Reached target Local Encrypted Volumes.
[  OK  ] Stopped target Switch Root.
[  OK  ] Stopped target Initrd File Systems.
[  OK  ] Stopped target Initrd Root File System.
[  OK  ] Reached target Local Integrity Protected Volumes.
[  OK  ] Reached target Host and Network Name Lookups.
[  OK  ] Reached target rpc_pipefs.target.
[  OK  ] Reached target Slice Units.
[  OK  ] Reached target Local Verity Protected Volumes.
[  OK  ] Listening on Device-mapper event daemon FIFOs.
[  OK  ] Listening on LVM2 poll daemon socket.
[  OK  ] Listening on RPCbind Server Activation Socket.
[  OK  ] Reached target RPC Port Mapper.
[  OK  ] Listening on Process Core Dump Socket.
[  OK  ] Listening on initctl Compatibility Named Pipe.
[  OK  ] Listening on udev Control Socket.
[  OK  ] Listening on udev Kernel Socket.
         Mounting Huge Pages File System...
         Mounting POSIX Message Queue File System...
         Mounting Kernel Debug File System...
         Mounting Kernel Trace File System...
         Starting iscsi-starter.service...
         Starting Create List of Static Device Nodes...
         Starting Monitoring of LVM2 mirror��ing dmeventd or progress polling...
         Starting Load Kernel Module configfs...
         Starting Load Kernel Module drm...
         Starting Load Kernel Module efi_pstore...
         Starting Load Kernel Module fuse...
         Starting Read and set NIS domainname from /etc/sysconfig/network...
[  OK  ] Stopped File System Check on Root Device.
[  OK  ] Stopped Journal Service.
         Starting Journal Service...
         Starting Generate network units from Kernel command line...
         Starting Remount Root and Kernel File Systems...
         Starting Apply Kernel Variables...
         Starting Coldplug All udev Devices...
[  OK  ] Mounted Huge Pages File System.
[  OK  ] Mounted POSIX Message Queue File System.
[  OK  ] Mounted Kernel Debug File System.
[  OK  ] Mounted Kernel Trace File System.
[  OK  ] Finished Create List of Static Device Nodes.
[  OK  ] Finished Monitoring of LVM2 mirror��using dmeventd or progress polling.
[  OK  ] Finished Load Kernel Module configfs.
[  OK  ] Finished Load Kernel Module drm.
[  OK  ] Finished Load Kernel Module efi_pstore.
[  OK  ] Finished Read and set NIS domainname from /etc/sysconfig/network.
[  OK  ] Finished Generate network units from Kernel command line.
[  OK  ] Finished Remount Root and Kernel File Systems.
         Activating swap /.swapfile...
         Starting Load Kernel Module efi_pstore...
         Starting Load/Save OS Random Seed...
         Starting Create Static Device Nodes in /dev...
[  OK  ] Activated swap /.swapfile.
[  OK  ] Started Journal Service.
[  OK  ] Finished Load Kernel Module fuse.
[  OK  ] Finished Apply Kernel Variables.
[  OK  ] Finished Load Kernel Module efi_pstore.
[  OK  ] Finished Load/Save OS Random Seed.
[  OK  ] Reached target Swaps.
         Mounting FUSE Control File System...
         Starting Flush Journal to Persistent Storage...
[  OK  ] Mounted FUSE Control File System.
[  OK  ] Finished iscsi-starter.service.
[  OK  ] Finished Flush Journal to Persistent Storage.
[  OK  ] Finished Create Static Device Nodes in /dev.
         Starting Rule-based Manager for Device Events and Files...
[  OK  ] Finished Coldplug All udev Devices.
         Starting Wait for udev To Complete Device Initialization...
[  OK  ] Started Rule-based Manager for Device Events and Files.
         Starting Load Kernel Module configfs...
[  OK  ] Finished Load Kernel Module configfs.
[  OK  ] Started /usr/sbin/lvm vgchange -aay --autoactivation event ocivolume.
[  OK  ] Finished Wait for udev To Complete Device Initialization.
[  OK  ] Reached target Preparation for Local File Systems.
         Mounting /boot...
         Mounting /var/oled...
         Starting File System Check on /dev/disk/by-uuid/BBF7-A736...
[  OK  ] Mounted /var/oled.
[  OK  ] Mounted /boot.
[  OK  ] Finished File System Check on /dev/disk/by-uuid/BBF7-A736.
         Mounting /boot/efi...
[  OK  ] Mounted /boot/efi.
[  OK  ] Reached target Local File Systems.
         Starting Apply Ksplice updates...
         Starting Automatic Boot Loader Update...
         Starting Create Volatile Files and Directories...
[  OK  ] Finished Automatic Boot Loader Update.
[  OK  ] Finished Create Volatile Files and Directories.
         Starting Security Auditing Service...
         Starting RPC Bind...
[  OK  ] Started RPC Bind.
[  OK  ] Started Security Auditing Service.
         Starting Record System Boot/Shutdown in UTMP...
[  OK  ] Finished Record System Boot/Shutdown in UTMP.
[  OK  ] Reached target System Initialization.
[  OK  ] Started "Monitor the /etc/unified-…ent/conf.d/ directory for changes".
[  OK  ] Started dnf makecache --timer.
[  OK  ] Started Ksplice Agent timer.
[  OK  ] Started Daily rotation of log files.
[  OK  ] Started Updates mlocate database every day.
[  OK  ] Started Daily Cleanup of Temporary Directories.
[  OK  ] Started Run unified-monitoring-agent configuration automatic updater..
[  OK  ] Reached target Path Units.
[  OK  ] Listening on D-Bus System Message Bus Socket.
[  OK  ] Listening on Open-iSCSI iscsid Socket.
[  OK  ] Listening on Open-iSCSI iscsiuio Socket.
[  OK  ] Listening on SSSD Kerberos Cache Manager responder socket.
[  OK  ] Reached target Socket Units.
         Starting Cloud-init: Local Stage (pre-network)...
         Starting D-Bus System Message Bus...
         Starting DTrace USDT probe creation daemon...
[  OK  ] Started DTrace USDT probe creation daemon.
[  OK  ] Reached target DTrace USDT operating normally.
[  OK  ] Started D-Bus System Message Bus.
[  OK  ] Reached target Basic System.
         Starting Check whether IPv6 instance for chrony.conf updates....
         Starting Restore /run/initramfs on shutdown...
         Starting firewalld - dynamic firewall daemon...
[  OK  ] Started libstoragemgmt plug-in server daemon.
         Starting Generate random NFS client ID...
[  OK  ] Reached target User and Group Name Lookups.
         Starting User Login Management...
[  OK  ] Finished Restore /run/initramfs on shutdown.
[  OK  ] Finished Check whether IPv6 instance for chrony.conf updates..
[  OK  ] Finished Generate random NFS client ID.
[  OK  ] Started User Login Management.
[   14.632482] cloud-init[1508]: Cloud-init v. 24.4-7.0.1.el9_7.1 running 'init-local' at Thu, 25 Jun 2026 09:28:47 +0000. Up 14.52 seconds.
[  OK  ] Finished Apply Ksplice updates.
[  OK  ] Finished Cloud-init: Local Stage (pre-network).
[  OK  ] Started firewalld - dynamic firewall daemon.
[  OK  ] Reached target Preparation for Network.
         Starting Network Manager...
         Starting Authorization Manager...
         Starting Hostname Service...
[  OK  ] Started Authorization Manager.
[  OK  ] Started Hostname Service.
[  OK  ] Listening on Load/Save RF Kill Switch Status /dev/rfkill Watch.
         Starting Network Manager Script Dispatcher Service...
[  OK  ] Started Network Manager.
[  OK  ] Reached target Network.
         Starting Network Manager Wait Online...
         Starting GSSAPI Proxy Daemon...
         Starting Dynamic System Tuning Daemon...
[  OK  ] Started Network Manager Script Dispatcher Service.
[  OK  ] Started GSSAPI Proxy Daemon.
[  OK  ] Reached target NFS client services.
[  OK  ] Finished Network Manager Wait Online.
         Starting Cloud-init: Network Stage...
[   16.936564] cloud-init[1974]: Cloud-init v. 24.4-7.0.1.el9_7.1 running 'init' at Thu, 25 Jun 2026 09:28:49 +0000. Up 16.84 seconds.
[   17.017663] cloud-init[1974]: ci-info: ++++++++++++++++++++++++++++++++++++Net device info+++++++++++++++++++++++++++++++++++++
[   17.033464] cloud-init[1974]: ci-info: +--------+------+-------------------------+---------------+--------+-------------------+
[   17.053274] cloud-init[1974]: ci-info: | Device |  Up  |         Address         |      Mask     | Scope  |     Hw-Address    |
[   17.073588] cloud-init[1974]: ci-info: +--------+------+-------------------------+---------------+--------+-------------------+
[   17.093290] cloud-init[1974]: ci-info: | enp0s6 | True |        10.0.0.187       | 255.255.255.0 | global | 02:00:17:00:15:92 |
[   17.113572] cloud-init[1974]: ci-info: | enp0s6 | True | fe80::17ff:fe00:1592/64 |       .       |  link  | 02:00:17:00:15:92 |
[   17.128746] cloud-init[1974]: ci-info: |   lo   | True |        127.0.0.1        |   255.0.0.0   |  host  |         .         |
[   17.150343] cloud-init[1974]: ci-info: |   lo   | True |         ::1/128         |       .       |  host  |         .         |
[   17.170614] cloud-init[1974]: ci-info: +--------+------+-------------------------+---------------+--------+-------------------+
[   17.189355] cloud-init[1974]: ci-info: +++++++++++++++++++++++++++Route IPv4 info++++++++++++++++++++++++++++
[   17.206862] cloud-init[1974]: ci-info: +-------+-------------+----------+---------------+-----------+-------+
[   17.225996] cloud-init[1974]: ci-info: | Route | Destination | Gateway  |    Genmask    | Interface | Flags |
[   17.245480] cloud-init[1974]: ci-info: +-------+-------------+----------+---------------+-----------+-------+
[   17.264511] cloud-init[1974]: ci-info: |   0   |   0.0.0.0   | 10.0.0.1 |    0.0.0.0    |   enp0s6  |   UG  |
[   17.281459] cloud-init[1974]: ci-info: |   1   |   10.0.0.0  | 0.0.0.0  | 255.255.255.0 |   enp0s6  |   U   |
[   17.299598] cloud-init[1974]: ci-info: |   2   | 169.254.0.0 | 0.0.0.0  |  255.255.0.0  |   enp0s6  |   U   |
[   17.320552] cloud-init[1974]: ci-info: +-------+-------------+----------+---------------+-----------+-------+
[   17.337328] cloud-init[1974]: ci-info: +++++++++++++++++++Route IPv6 info+++++++++++++++++++
[   17.353359] cloud-init[1974]: ci-info: +-------+-------------+---------+-----------+-------+
[   17.369460] cloud-init[1974]: ci-info: | Route | Destination | Gateway | Interface | Flags |
[   17.383894] cloud-init[1974]: ci-info: +-------+-------------+---------+-----------+-------+
[   17.402823] cloud-init[1974]: ci-info: |   1   |  fe80::/64  |    ::   |   enp0s6  |   U   |
[   17.418042] cloud-init[1974]: ci-info: |   3   |    local    |    ::   |   enp0s6  |   U   |
[   17.434606] cloud-init[1974]: ci-info: |   4   |  multicast  |    ::   |   enp0s6  |   U   |
[   17.452510] cloud-init[1974]: ci-info: +-------+-------------+---------+-----------+-------+
[  OK  ] Started Dynamic System Tuning Daemon.
[  OK  ] Finished Cloud-init: Network Stage.
[  OK  ] Reached target Cloud-config availability.
[  OK  ] Reached target Network is Online.
         Starting NTP client/server...
         Starting Open-iSCSI...
         Starting Prefetch new Ksplice updates...
         Starting Update kernel loglevel for OCI instances...
         Starting Set MTU of IPv6 VNICs to 9000...
[  OK  ] Started Oracle Cloud Infrastructure Yum Region Setting Service.
         Starting Cloud-init: Config Stage...
[  OK  ] Started Oracle Cloud Infrastructure agent updater.
         Starting Performance Metrics Collector Daemon...
         Starting Notify NFS peers of a restart...
         Starting System Logging Service...
[  OK  ] Reached target sshd-keygen.target.
         Starting OpenSSH server daemon...
[  OK  ] Started unified-monitoring-agent: ��or for Oracle Cloud Infrastructure.
[  OK  ] Started Oracle Cloud Infrastructur���gent for management and monitoring.
         Starting unified-monitoring-agent Fluentd configuration downloader....
[  OK  ] Started Open-iSCSI.
[  OK  ] Started NTP client/server.
[  OK  ] Finished Update kernel loglevel for OCI instances.
[  OK  ] Finished Set MTU of IPv6 VNICs to 9000.
[  OK  ] Started Notify NFS peers of a restart.
         Starting Logout off all iSCSI sessions on shutdown...
         Starting Login and scanning of iSCSI devices...
[  OK  ] Finished Logout off all iSCSI sessions on shutdown.
[  OK  ] Finished Login and scanning of iSCSI devices.
[  OK  ] Reached target Preparation for Remote File Systems.
[  OK  ] Reached target Remote File Systems.
         Starting Crash recovery kernel arming...
         Starting Permit User Sessions...
[  OK  ] Started OpenSSH server daemon.
[  OK  ] Finished Permit User Sessions.
[  OK  ] Started Deferred execution scheduler.
[  OK  ] Started Command Scheduler.
[  OK  ] Started Getty on tty1.
[  OK  ] Started Serial Getty on ttyAMA0.
[  OK  ] Reached target Login Prompts.
[  OK  ] Started System Logging Service.
[  OK  ] Created slice User Slice of UID 988.
         Starting User Runtime Directory /run/user/988...
[  OK  ] Finished User Runtime Directory /run/user/988.
         Starting User Manager for UID 988...
[  OK  ] Started User Manager for UID 988.
[  OK  ] Started Session c1 of User ocarun.
[   22.927991] cloud-init[2507]: Cloud-init v. 24.4-7.0.1.el9_7.1 running 'modules:config' at Thu, 25 Jun 2026 09:28:55 +0000. Up 22.34 seconds.

Oracle Linux Server 9.7
Kernel 6.12.0-203.76.7.3.el9uek.aarch64 on an aarch64

Activate the web console with: systemctl enable --now cockpit.socket

tap2go-vnic login: [   25.737672] block dm-1: the capability attribute has been deprecated.
[   31.247044] cloud-init[4041]: Cloud-init v. 24.4-7.0.1.el9_7.1 running 'modules:final' at Thu, 25 Jun 2026 09:29:03 +0000. Up 31.20 seconds.
[   31.315353] cloud-init[4041]: Cloud-init v. 24.4-7.0.1.el9_7.1 finished at Thu, 25 Jun 2026 09:29:03 +0000. Datasource DataSourceOracle.  Up 31.30 seconds

tap2go-vnic login:          Stopping Session c1 of User ocarun...
[  OK  ] Removed slice Slice /system/modprobe.
[  OK  ] Removed slice Slice /system/sshd-keygen.
[  OK  ] Stopped target Cloud-init target.
[  OK  ] Stopped target Host and Network Name Lookups.
[  OK  ] Stopped target rpc_pipefs.target.
[  OK  ] Stopped target RPC Port Mapper.
[  OK  ] Stopped target Timer Units.
[  OK  ] Stopped dnf makecache --timer.
[  OK  ] Stopped Ksplice Agent timer.
[  OK  ] Stopped Daily rotation of log files.
[  OK  ] Stopped Updates mlocate database every day.
[  OK  ] Stopped Half-hourly check of PMIE instances.
[  OK  ] Stopped Daily processing of PMIE logs.
[  OK  ] Stopped Half-hourly check of pmie farm instances.
[  OK  ] Stopped Half-hourly check of pmlogger instances.
[  OK  ] Stopped Daily processing of archives.
[  OK  ] Stopped Half-hourly check of pmlogger farm instances.
[  OK  ] Stopped Daily Cleanup of Temporary Directories.
[  OK  ] Stopped Run unified-monitoring-agent configuration automatic updater..
[  OK  ] Closed LVM2 poll daemon socket.
[  OK  ] Closed Process Core Dump Socket.
[  OK  ] Closed Load/Save RF Kill Switch Status /dev/rfkill Watch.
         Unmounting RPC Pipe File System...
[  OK  ] Stopped Cloud-init: Final Stage.
[  OK  ] Stopped target Multi-User System.
[  OK  ] Stopped target Login Prompts.
         Stopping Deferred execution scheduler...
         Stopping NTP client/server...
[  OK  ] Stopped Cloud-init: Config Stage.
[  OK  ] Stopped target Cloud-config availability.
         Stopping Command Scheduler...
         Stopping Restore /run/initramfs on shutdown...
         Stopping Getty on tty1...
         Stopping libstoragemgmt plug-in server daemon...
[  OK  ] Stopped Oracle Cloud Infrastructure Yum Region Setting Service.[  479.669185] sda2: Can't mount, would change RO state

         Stopping Oracle Cloud Infrastructure agent updater...
         Stopping Oracle Cloud Infrastructu��nt for management and monitoring...
         Stopping pmie farm service...
         Stopping pmlogger farm service...
         Stopping System Logging Service...
         Stopping Serial Getty on ttyAMA0...
         Stopping OpenSSH server daemon...
         Stopping Load/Save OS Random Seed...
         Stopping Dynamic System Tuning Daemon...
[  OK  ] Stopped libstoragemgmt plug-in server daemon.
[  OK  ] Stopped Oracle Cloud Infrastructure agent updater.
[  OK  ] Stopped NTP client/server.
[  OK  ] Stopped OpenSSH server daemon.
[  OK  ] Stopped System Logging Service.
[  OK  ] Stopped Deferred execution scheduler.
[  OK  ] Stopped Command Scheduler.
[  OK  ] Stopped Getty on tty1.
[  OK  ] Stopped Serial Getty on ttyAMA0.
[  OK  ] Stopped pmie farm service.
[  OK  ] Stopped pmlogger farm service.
[  OK  ] Unmounted RPC Pipe File System.
[  OK  ] Stopped Load/Save OS Random Seed.
[  OK  ] Stopped Session c1 of User ocarun.
[  OK  ] Removed slice Slice /system/getty.
[  OK  ] Removed slice Slice /system/serial-getty.
[  OK  ] Stopped target sshd-keygen.target.
         Stopping Performance Metrics Inference Engine...
         Stopping Performance Metrics Archive Logger...
         Stopping User Login Management...
         Stopping User Manager for UID 988...
[  OK  ] Stopped User Manager for UID 988.
[  OK  ] Stopped User Login Management.
         Stopping Permit User Sessions...
         Stopping User Runtime Directory /run/user/988...
[  OK  ] Unmounted /run/user/988.
[  OK  ] Stopped User Runtime Directory /run/user/988.
[  OK  ] Removed slice User Slice of UID 988.
[  OK  ] Stopped Permit User Sessions.
[  OK  ] Stopped target User and Group Name Lookups.
[  OK  ] Stopped target Remote File Systems.
[  OK  ] Stopped target Preparation for Remote File Systems.
[  OK  ] Stopped target NFS client services.
         Stopping GSSAPI Proxy Daemon...
         Stopping Logout off all iSCSI sessions on shutdown...
[  OK  ] Stopped Login and scanning of iSCSI devices.
[  OK  ] Stopped GSSAPI Proxy Daemon.
[  OK  ] Stopped Logout off all iSCSI sessions on shutdown.
         Stopping Open-iSCSI...
[  OK  ] Stopped Open-iSCSI.
[  OK  ] Stopped Performance Metrics Archive Logger.
[  OK  ] Stopped Dynamic System Tuning Daemon.
[  OK  ] Stopped Performance Metrics Inference Engine.
         Stopping Performance Metrics Collector Daemon...
[  OK  ] Stopped Performance Metrics Collector Daemon.
[  OK  ] Stopped Restore /run/initramfs on shutdown.
[  OK  ] Stopped Oracle Cloud Infrastructur��gent for management and monitoring.
[  OK  ] Removed slice Slice /oca.
         Stopping unified-monitoring-agent:��� for Oracle Cloud Infrastructure...^[
[  OK  ] Stopped unified-monitoring-agent: …or for Oracle Cloud Infrastructure.
[  OK  ] Stopped target Network is Online.
[  OK  ] Stopped target Network.
[  OK  ] Stopped Cloud-init: Network Stage.
[  OK  ] Stopped Network Manager Wait Online.
         Stopping Network Manager...
[  OK  ] Stopped Network Manager.
[  OK  ] Stopped target Preparation for Network.
         Stopping Network Manager Script Dispatcher Service...
[  OK  ] Stopped Cloud-init: Local Stage (pre-network).
         Stopping firewalld - dynamic firewall daemon...
[  OK  ] Stopped Generate network units from Kernel command line.
[  OK  ] Stopped Network Manager Script Dispatcher Service.
[  OK  ] Stopped firewalld - dynamic firewall daemon.
         Stopping Authorization Manager...
[  OK  ] Stopped Authorization Manager.
[  OK  ] Stopped target Basic System.
[  OK  ] Stopped target DTrace USDT operating normally.
[  OK  ] Stopped target Slice Units.
[  OK  ] Removed slice User and Session Slice.
         Stopping D-Bus System Message Bus...
         Stopping DTrace USDT probe creation daemon...
[  OK  ] Stopped DTrace USDT probe creation daemon.
[  OK  ] Stopped target Path Units.
[  OK  ] Stopped "Monitor the /etc/unified-��ent/conf.d/ directory for changes".
[  OK  ] Stopped target Socket Units.
[  OK  ] Closed Open-iSCSI iscsid Socket.
[  OK  ] Closed Open-iSCSI iscsiuio Socket.
[  OK  ] Closed SSSD Kerberos Cache Manager responder socket.
[  OK  ] Stopped D-Bus System Message Bus.
[  OK  ] Closed D-Bus System Message Bus Socket.
[  OK  ] Stopped target System Initialization.
[  OK  ] Unset automount Arbitrary Executab…ormats File System Automount Point.
[  OK  ] Stopped target Local Encrypted Volumes.
[  OK  ] Stopped Dispatch Password Requests to Console Directory Watch.
[  OK  ] Stopped Forward Password Requests to Wall Directory Watch.
[  OK  ] Stopped target Local Integrity Protected Volumes.
[  OK  ] Stopped target Swaps.
[  OK  ] Stopped target Local Verity Protected Volumes.
         Deactivating swap /.swapfile...
[  OK  ] Stopped Read and set NIS domainname from /etc/sysconfig/network.
[  OK  ] Stopped Automatic Boot Loader Update.
[  OK  ] Stopped Apply Kernel Variables.
         Stopping Record System Boot/Shutdown in UTMP...
[  OK  ] Unmounted /run/credentials/systemd-sysctl.service.
[  OK  ] Deactivated swap /.swapfile.
[  OK  ] Stopped Record System Boot/Shutdown in UTMP.
         Stopping Security Auditing Service...
[  506.043416] audit: type=1305 audit(1782380218.462:290): op=set audit_pid=0 old=1436 auid=4294967295 ses=4294967295 subj=system_u:system_r:auditd_t:s0 res=1
[  OK  ] Stopped Security Auditing Service.
[  506.068838] audit: type=1131 audit(1782380218.486:291): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=auditd comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
[  OK  ] Stopped Create Volatile Files and Directories.
[  OK  ] Stopped target Local File Systems.
[  506.108310] audit: type=1131 audit(1782380218.518:292): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-tmpfiles-setup comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
         Unmounting /boot/efi...
         Unmounting /run/credentials/systemd-tmpfiles-setup.service...
         Unmounting /run/credentials/systemd-tmpfiles-setup-dev.service...
         Unmounting /var/oled...
[  506.185053] XFS (dm-1): Unmounting Filesystem e392ff56-e796-41c4-82a1-3917935488e2
[  OK  ] Unmounted /boot/efi.
[  OK  ] Unmounted /run/credentials/systemd-tmpfiles-setup.service.
[  OK  ] Unmounted /run/credentials/systemd-tmpfiles-setup-dev.service.
[  OK  ] Unmounted /var/oled.
         Unmounting /boot...
[  OK  ] Stopped File System Check on /dev/disk/by-uuid/BBF7-A736.[  506.261182] XFS (sda2): Unmounting Filesystem e92cbce5-d8b8-456e-942e-25eb67631fce

[  OK  ] Removed slice Slice /system/systemd-fsck.[  506.277445] audit: type=1131 audit(1782380218.690:293): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-fsck@dev-disk-by\x2duuid-BBF7\x2dA736 comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'

[  OK  ] Unmounted /boot.
[  OK  ] Stopped target Preparation for Local File Systems.
[  OK  ] Reached target Unmount All Filesystems.
         Stopping Monitoring of LVM2 mirror��ing dmeventd or progress polling...
[  OK  ] Stopped Remount Root and Kernel File Systems.
[  OK  ] Stopped Create Static Device Nodes in /dev.[  506.378732] audit: type=1131 audit(1782380218.786:294): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-remount-fs comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'

[  506.406715] audit: type=1131 audit(1782380218.822:295): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-tmpfiles-setup-dev comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
[  OK  ] Stopped Monitoring of LVM2 mirrors…using dmeventd or progress polling.
[  506.471871] audit: type=1131 audit(1782380218.890:296): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=lvm2-monitor comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
[  OK  ] Reached target System Shutdown.
[  OK  ] Reached target Late Shutdown Services.
[  OK  ] Finished System Power Off.
[  506.516050] audit: type=1130 audit(1782380218.934:297): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-poweroff comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
[  506.539182] audit: type=1131 audit(1782380218.934:298): pid=1 uid=0 auid=4294967295 ses=4294967295 subj=system_u:system_r:init_t:s0 msg='unit=systemd-poweroff comm="systemd" exe="/usr/lib/systemd/systemd" hostname=? addr=? terminal=? res=success'
[  OK  ] Reached target System Power Off.
[  506.570718] audit: type=1334 audit(1782380218.978:299): prog-id=19 op=UNLOAD
[  506.633594] systemd-shutdown[1]: Syncing filesystems and block devices.
[  506.642605] systemd-shutdown[1]: Sending SIGTERM to remaining processes...
[  506.653265] systemd-journald[1065]: Received SIGTERM from PID 1 (systemd-shutdow).
[  506.682642] systemd-shutdown[1]: Sending SIGKILL to remaining processes...
[  506.692447] systemd-shutdown[1]: Unmounting file systems.
[  506.699284] [5600]: Remounting '/' read-only with options 'seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota'.
[  506.710400] XFS: attr2 mount option is deprecated.
[  506.729668] systemd-shutdown[1]: All filesystems unmounted.
[  506.737313] systemd-shutdown[1]: Deactivating swaps.
[  506.742762] systemd-shutdown[1]: All swaps deactivated.
[  506.748613] systemd-shutdown[1]: Detaching loop devices.
[  506.755068] systemd-shutdown[1]: All loop devices detached.
[  506.761153] systemd-shutdown[1]: Stopping MD devices.
[  506.767299] systemd-shutdown[1]: All MD devices stopped.
[  506.773079] systemd-shutdown[1]: Detaching DM devices.
[  506.779053] systemd-shutdown[1]: Failed to get MD_LEVEL property for /dev/dm-0, ignoring: No such file or directory
[  506.790543] systemd-shutdown[1]: Failed to get MD_LEVEL property for /dev/dm-1, ignoring: No such file or directory
[  506.801823] systemd-shutdown[1]: All DM devices detached.
[  506.807782] systemd-shutdown[1]: All filesystems, swaps, loop devices, MD devices and DM devices detached.
[  507.001251] [5601]: /usr/lib/systemd/system-shutdown/uptrack-save.sh failed with exit status 1.
[  507.011919] systemd-shutdown[1]: Successfully changed into root pivot.
[  507.019148] systemd-shutdown[1]: Returning to initrd...
[  507.077336] dracut: Taking over mdmon processes.
[  507.082531] dracut Warning: Killing all remaining processes
dracut Warning: Killing all remaining processes
[  507.143785] XFS (dm-0): Unmounting Filesystem 58977eb5-acd1-477b-bdc7-b0eb7b05afa7
[  507.160683] dracut Warning: Unmounted /oldroot.
dracut Warning: Unmounted /oldroot.
506.943474 | /etc/multipath.conf does not exist, blacklisting all devices.
506.950589 | You can run "/sbin/mpathconf --enable" to create
506.955588 | /etc/multipath.conf. See man mpathconf(8) for more details
506.961393 | invalid value for WatchdogSec: "0"
506.969763 | DM multipath kernel driver not loaded
[  507.227867] dracut: Disassembling device-mapper devices
[  507.277238] dracut: Waiting for mdraid devices to be clean.
[  507.286046] dracut: Disassembling mdraid devices.
Powering off.
[  507.330021] reboot: Power down
Oracle AAVMF Version: 1.6.6.cvm
PEIM Loaded: PcdPeim.efi
PEIM Loaded: ResetSystemPei.efi
PEIM Loaded: MemoryInit.efi
PEIM Loaded: PeiCore.efi
PEIM Loaded: PcdPeim.efi
PEIM Loaded: CpuPei.efi
PEIM Loaded: PlatformPei.efi
PEIM Loaded: DxeIpl.efi
PEI Phase: Complete.
PEIM Loaded: DxeCore.efi
Loading DXE Modules:
Image Loaded: DevicePathDxe.efi
Image Loaded: PcdDxe.efi
Image Loaded: FdtClientDxe.efi
Image Loaded: RuntimeDxe.efi
Image Loaded: SecurityStubDxe.efi
Image Loaded: MetronomeDxe.efi
Image Loaded: HiiDatabase.efi
Image Loaded: SerialDxe.efi
Image Loaded: ReportStatusCodeRouterRuntimeDxe.efi
Image Loaded: DpcDxe.efi
Image Loaded: EbcDxe.efi
Image Loaded: VirtioFdtDxe.efi
Image Loaded: FaultTolerantWriteDxe.efi
Image Loaded: ResetSystemRuntimeDxe.efi
Image Loaded: ArmGicDxe.efi
Image Loaded: tftpDynamicCommand.efi
Image Loaded: httpDynamicCommand.efi
Image Loaded: LinuxInitrdDynamicShellCommand.efi
Image Loaded: SetupBrowser.efi
Image Loaded: SmbiosDxe.efi
Image Loaded: ArmPciCpuIo2Dxe.efi
Image Loaded: PciHotPlugInitDxe.efi
Image Loaded: QemuRamfbDxe.efi
Image Loaded: LogoDxe.efi
Image Loaded: ArmCpuDxe.efi
Image Loaded: ArmTimerDxe.efi
Image Loaded: DisplayEngine.efi
Image Loaded: DriverHealthManagerDxe.efi
Image Loaded: SmbiosPlatformDxe.efi
Image Loaded: RamDiskDxe.efi
Image Loaded: HighMemDxe.efi
Image Loaded: ArmVeNorFlashDxe.efi
Image Loaded: WatchdogTimer.efi
Image Loaded: PciHostBridgeDxe.efi
Image Loaded: VariableRuntimeDxe.efi
Image Loaded: CapsuleRuntimeDxe.efi
Image Loaded: MonotonicCounterRuntimeDxe.efi
Image Loaded: RealTimeClock.efi
Image Loaded: BdsDxe.efi
Image Loaded: PlatformHasAcpiDtDxe.efi
Image Loaded: PlatformDxe.efi
Image Loaded: Tcg2Dxe.efi
Image Loaded: ConPlatformDxe.efi
Image Loaded: ConSplitterDxe.efi
Image Loaded: GraphicsConsoleDxe.efi
Image Loaded: TerminalDxe.efi
Image Loaded: DiskIoDxe.efi
Image Loaded: PartitionDxe.efi
Image Loaded: Fat.efi
Image Loaded: EnglishDxe.efi
Image Loaded: UdfDxe.efi
Image Loaded: VirtioFsDxe.efi
Image Loaded: VirtioBlkDxe.efi
Image Loaded: VirtioNetDxe.efi
Image Loaded: VirtioScsiDxe.efi
Image Loaded: VirtioRngDxe.efi
Image Loaded: QemuKernelLoaderFsDxe.efi
Image Loaded: VlanConfigDxe.efi
Image Loaded: MnpDxe.efi
Image Loaded: ArpDxe.efi
Image Loaded: Dhcp4Dxe.efi
Image Loaded: Ip4Dxe.efi
Image Loaded: Udp4Dxe.efi
Image Loaded: Mtftp4Dxe.efi
Image Loaded: TcpDxe.efi
Image Loaded: UefiPxeBcDxe.efi
Image Loaded: IScsiDxe.efi
Image Loaded: ScsiBus.efi
Image Loaded: ScsiDisk.efi
Image Loaded: NvmExpressDxe.efi
Image Loaded: AcpiTableDxe.efi
Image Loaded: BootGraphicsResourceTableDxe.efi
Image Loaded: PciBusDxe.efi
Image Loaded: VirtioPciDeviceDxe.efi
Image Loaded: Virtio10.efi
SecureBoot: Disabled
Boot Options:
   Boot0005: Oracle Linux  <HD(1,GPT,32E67351-51CD-40B2-BC40-EDBE69760D78,0x800,0x32000)/\EFI\redhat\shimaa64.efi>
   Boot0002: UEFI ORACLE BlockVolume   <PciRoot(0x0)/Pci(0x5,0x7)/Pci(0x0,0x0)/Scsi(0x0,0x1)>
   Boot0001: UEFI Misc Device  <VenHw(93E34C7E-B50E-11DF-9223-2443DFD72085,00)>
   Boot0004: EFI Internal Shell  <Fv(64074AFE-340A-4BE6-94BA-91B5B4D0F71E)/FvFile(7C04A583-9E3E-4F1C-AD65-E05268D0B4D1)>
BootNext: 
Loading Boot0005 "Oracle Linux" from HD(1,GPT,32E67351-51CD-40B2-BC40-EDBE69760D78,0x800,0x32000)/\EFI\redhat\shimaa64.efi
Starting Boot0005 "Oracle Linux" from HD(1,GPT,32E67351-51CD-40B2-BC40-EDBE69760D78,0x800,0x32000)/\EFI\redhat\shimaa64.efi
EFI stub: Booting Linux Kernel...
EFI stub: EFI_RNG_PROTOCOL unavailable
EFI stub: Using DTB from configuration table
EFI stub: Exiting boot services...

Welcome to Oracle Linux Server 9.7 dracut-057-104.git20250919.0.3.el9_7 (Initramfs)!

[  OK  ] Started Dispatch Password Requests to Console Directory Watch.
[  OK  ] Reached target Local Encrypted Volumes.
[  OK  ] Reached target Initrd /usr File System.
[  OK  ] Reached target Path Units.
[  OK  ] Reached target Slice Units.
[  OK  ] Reached target Swaps.
[  OK  ] Reached target Timer Units.
[  OK  ] Listening on D-Bus System Message Bus Socket.
[  OK  ] Listening on Open-iSCSI iscsid Socket.
[  OK  ] Listening on Open-iSCSI iscsiuio Socket.
[  OK  ] Listening on Journal Socket (/dev/log).
[  OK  ] Listening on Journal Socket.
[  OK  ] Listening on udev Control Socket.
[  OK  ] Listening on udev Kernel Socket.
[  OK  ] Reached target Socket Units.
         Starting Create List of Static Device Nodes...
         Starting Journal Service...
         Starting Apply Kernel Variables...
         Starting Create System Users...
         Starting Setup Virtual Console...
[  OK  ] Finished Create List of Static Device Nodes.
[  OK  ] Finished Apply Kernel Variables.
[  OK  ] Finished Create System Users.
         Starting Create Static Device Nodes in /dev...
[  OK  ] Finished Create Static Device Nodes in /dev.
[  OK  ] Started Journal Service.
         Starting Create Volatile Files and Directories...
[  OK  ] Finished Setup Virtual Console.
         Starting dracut ask for additional cmdline parameters...
[  OK  ] Finished dracut ask for additional cmdline parameters.
         Starting dracut cmdline hook...
[  OK  ] Finished Create Volatile Files and Directories.
[    1.926563] dracut-cmdline[266]: /lib/net-lib.sh: line 428: shift: shift count out of range
[    1.940534] dracut-cmdline[266]: /lib/net-lib.sh: line 458: shift: shift count out of range
[  OK  ] Finished dracut cmdline hook.
         Starting dracut pre-udev hook...
[  OK  ] Finished dracut pre-udev hook.
         Starting Rule-based Manager for Device Events and Files...
[  OK  ] Started Rule-based Manager for Device Events and Files.
         Starting dracut pre-trigger hook...
[  OK  ] Finished dracut pre-trigger hook.
         Starting Coldplug All udev Devices...
[  OK  ] Created slice Slice /system/modprobe.
         Starting Load Kernel Module configfs...
[  OK  ] Finished Load Kernel Module configfs.
[  OK  ] Finished Coldplug All udev Devices.
         Mounting Kernel Configuration File System...
         Starting nm-initrd.service...
         Starting Wait for udev To Complete Device Initialization...
[  OK  ] Mounted Kernel Configuration File System.
         Starting D-Bus System Message Bus...
[  OK  ] Started D-Bus System Message Bus.
[  OK  ] Started nm-initrd.service.
[  OK  ] Reached target Network.
         Starting nm-wait-online-initrd.service...
[  OK  ] Finished Wait for udev To Complete Device Initialization.
[  OK  ] Reached target Preparation for Local File Systems.
[  OK  ] Reached target Local File Systems.
[  OK  ] Reached target System Initialization.
[  OK  ] Reached target Basic System.
[  OK  ] Finished nm-wait-online-initrd.service.
         Starting dracut initqueue hook...
[    4.095112] dracut-initqueue[641]: iscsiadm: Could not get list of targets from firmware. (err 21)
[    4.107518] dracut-initqueue[633]: Warning: iscsiadm: Could not get list of targets from firmware.
[    4.174403] dracut-initqueue[652]: /lib/net-lib.sh: line 428: shift: shift count out of range
[    4.188281] dracut-initqueue[652]: /lib/net-lib.sh: line 458: shift: shift count out of range
         Starting Open-iSCSI...
[  OK  ] Started Open-iSCSI.
[    5.263802] dracut-initqueue[716]: iscsiadm: Cannot resolve host iscsi. getaddrinfo error: [Name or service not known]
[    5.281961] dracut-initqueue[716]: iscsiadm: cannot resolve host name iscsi
[    5.296493] dracut-initqueue[716]: iscsiadm: cannot resolve host name iscsi
         Starting Dummy iscsi-shutdown.service for the initrd...
[    5.317596] dracut-initqueue[716]: iscsiadm: Could not perform SendTargets discovery: encountered connection failure
[    5.340643] dracut-initqueue[652]: Warning: Target discovery to iscsi:3260 failed with status 0
[  OK  ] Finished Dummy iscsi-shutdown.service for the initrd.
[    5.374872] dracut-initqueue[746]: iscsiadm: Could not get list of targets from firmware. (err 21)
[    5.388628] dracut-initqueue[737]: Warning: iscsiadm: Could not get list of targets from firmware.
[    5.455931] dracut-initqueue[757]: /lib/net-lib.sh: line 428: shift: shift count out of range
[    5.469861] dracut-initqueue[757]: /lib/net-lib.sh: line 458: shift: shift count out of range
[    5.494864] dracut-initqueue[815]: iscsiadm: Cannot resolve host iscsi. getaddrinfo error: [Name or service not known]
[    5.512106] dracut-initqueue[815]: iscsiadm: cannot resolve host name iscsi
[    5.524469] dracut-initqueue[815]: iscsiadm: cannot resolve host name iscsi
[    5.536625] dracut-initqueue[815]: iscsiadm: Could not perform SendTargets discovery: encountered connection failure
[    5.552527] dracut-initqueue[757]: Warning: Target discovery to iscsi:3260 failed with status 0
[    5.575504] dracut-initqueue[833]: iscsiadm: Could not get list of targets from firmware. (err 21)
[    5.588581] dracut-initqueue[824]: Warning: iscsiadm: Could not get list of targets from firmware.
[    5.626966] dracut-initqueue[824]: /lib/net-lib.sh: line 428: shift: shift count out of range
[    5.641598] dracut-initqueue[824]: /lib/net-lib.sh: line 458: shift: shift count out of range
[    5.667328] dracut-initqueue[884]: iscsiadm: Cannot resolve host iscsi. getaddrinfo error: [Name or service not known]
[    5.684472] dracut-initqueue[884]: iscsiadm: cannot resolve host name iscsi
[    5.696458] dracut-initqueue[884]: iscsiadm: cannot resolve host name iscsi
[    5.706742] dracut-initqueue[884]: iscsiadm: Could not perform SendTargets discovery: encountered connection failure
[    5.725546] dracut-initqueue[824]: Warning: Target discovery to iscsi:3260 failed with status 0
[  OK  ] Found device /dev/mapper/ocivolume-root.
[  OK  ] Reached target Initrd Root Device.
[  OK  ] Finished dracut initqueue hook.
[  OK  ] Reached target Preparation for Remote File Systems.
[  OK  ] Reached target Remote Encrypted Volumes.
[  OK  ] Reached target Remote File Systems.
         Starting dracut pre-mount hook...
[  OK  ] Finished dracut pre-mount hook.
         Starting File System Check on /dev/mapper/ocivolume-root...
[  OK  ] Finished File System Check on /dev/mapper/ocivolume-root.
         Mounting /sysroot...
[  OK  ] Mounted /sysroot.
[  OK  ] Reached target Initrd Root File System.
         Starting Mountpoints Configured in the Real Root...
[  OK  ] Finished Mountpoints Configured in the Real Root.
[  OK  ] Reached target Initrd File Systems.
[  OK  ] Reached target Initrd Default Target.
         Starting dracut mount hook...
[  OK  ] Finished dracut mount hook.
         Starting dracut pre-pivot and cleanup hook...
[    6.556113] dracut-pre-pivot[994]: 6.555852 | /etc/multipath.conf does not exist, blacklisting all devices.
[    6.570326] dracut-pre-pivot[994]: 6.567320 | You can run "/sbin/mpathconf --enable" to create
[    6.584452] dracut-pre-pivot[994]: 6.567333 | /etc/multipath.conf. See man mpathconf(8) for more details
[    6.597270] dracut-pre-pivot[994]: 6.569561 | DM multipath kernel driver not loaded
[  OK  ] Finished dracut pre-pivot and cleanup hook.
         Starting Cleaning Up and Shutting Down Daemons...
[  OK  ] Stopped target Network.
[  OK  ] Stopped target Remote Encrypted Volumes.
[  OK  ] Stopped target Timer Units.
[  OK  ] Stopped dracut pre-pivot and cleanup hook.
[  OK  ] Stopped target Initrd Default Target.
[  OK  ] Stopped target Basic System.
[  OK  ] Stopped target Initrd Root Device.
[  OK  ] Stopped target Initrd /usr File System.
[  OK  ] Stopped target Path Units.
[  OK  ] Stopped target Remote File Systems.
[  OK  ] Stopped target Preparation for Remote File Systems.
[  OK  ] Stopped target Slice Units.
[  OK  ] Stopped target Socket Units.
[  OK  ] Stopped target System Initialization.
[  OK  ] Stopped target Local File Systems.
[  OK  ] Stopped target Preparation for Local File Systems.
[  OK  ] Stopped target Swaps.
[  OK  ] Closed Open-iSCSI iscsiuio Socket.
[  OK  ] Stopped dracut mount hook.
[  OK  ] Stopped dracut pre-mount hook.
[  OK  ] Stopped target Local Encrypted Volumes.
[  OK  ] Stopped Dispatch Password Requests to Console Directory Watch.
[  OK  ] Stopped dracut initqueue hook.
         Stopping Open-iSCSI...
[  OK  ] Stopped nm-wait-online-initrd.service.
         Stopping nm-initrd.service...
[  OK  ] Stopped Apply Kernel Variables.
[  OK  ] Stopped Wait for udev To Complete Device Initialization.
[  OK  ] Stopped Open-iSCSI.
[  OK  ] Finished Cleaning Up and Shutting Down Daemons.
[  OK  ] Closed Open-iSCSI iscsid Socket.
[  OK  ] Stopped nm-initrd.service.
         Stopping D-Bus System Message Bus...
[  OK  ] Stopped Coldplug All udev Devices.
[  OK  ] Stopped dracut pre-trigger hook.
         Stopping Rule-based Manager for Device Events and Files...
[  OK  ] Stopped D-Bus System Message Bus.
[  OK  ] Closed D-Bus System Message Bus Socket.
[  OK  ] Stopped Create Volatile Files and Directories.
[  OK  ] Stopped Rule-based Manager for Device Events and Files.
[  OK  ] Closed udev Control Socket.
[  OK  ] Closed udev Kernel Socket.
[  OK  ] Stopped dracut pre-udev hook.
[  OK  ] Stopped dracut cmdline hook.
[  OK  ] Stopped dracut ask for additional cmdline parameters.
         Starting Cleanup udev Database...
[  OK  ] Stopped Create Static Device Nodes in /dev.
[  OK  ] Stopped Create List of Static Device Nodes.
[  OK  ] Stopped Create System Users.
[  OK  ] Stopped Setup Virtual Console.
[  OK  ] Finished Cleanup udev Database.
[  OK  ] Reached target Switch Root.
         Starting Switch Root...

Welcome to Oracle Linux Server 9.7!

[  OK  ] Stopped Switch Root.
[  OK  ] Created slice Slice /oca.
[  OK  ] Created slice Slice /system/getty.
[  OK  ] Created slice Slice /system/serial-getty.
[  OK  ] Created slice Slice /system/sshd-keygen.
[  OK  ] Created slice Slice /system/systemd-fsck.
[  OK  ] Created slice User and Session Slice.
[  OK  ] Started Dispatch Password Requests to Console Directory Watch.
[  OK  ] Started Forward Password Requests to Wall Directory Watch.
[  OK  ] Set up automount Arbitrary Executa…ormats File System Automount Point.
[  OK  ] Reached target Local Encrypted Volumes.
[  OK  ] Stopped target Switch Root.
[  OK  ] Stopped target Initrd File Systems.
[  OK  ] Stopped target Initrd Root File System.
[  OK  ] Reached target Local Integrity Protected Volumes.
[  OK  ] Reached target Host and Network Name Lookups.
[  OK  ] Reached target rpc_pipefs.target.
[  OK  ] Reached target Slice Units.
[  OK  ] Reached target Local Verity Protected Volumes.
[  OK  ] Listening on Device-mapper event daemon FIFOs.
[  OK  ] Listening on LVM2 poll daemon socket.
[  OK  ] Listening on RPCbind Server Activation Socket.
[  OK  ] Reached target RPC Port Mapper.
[  OK  ] Listening on Process Core Dump Socket.
[  OK  ] Listening on initctl Compatibility Named Pipe.
[  OK  ] Listening on udev Control Socket.
[  OK  ] Listening on udev Kernel Socket.
         Mounting Huge Pages File System...
         Mounting POSIX Message Queue File System...
         Mounting Kernel Debug File System...
         Mounting Kernel Trace File System...
         Starting iscsi-starter.service...
         Starting Create List of Static Device Nodes...
         Starting Monitoring of LVM2 mirror…ing dmeventd or progress polling...
         Starting Load Kernel Module configfs...
         Starting Load Kernel Module drm...
         Starting Load Kernel Module efi_pstore...
         Starting Load Kernel Module fuse...
         Starting Read and set NIS domainname from /etc/sysconfig/network...
[  OK  ] Stopped File System Check on Root Device.
[  OK  ] Stopped Journal Service.
         Starting Journal Service...
         Starting Generate network units from Kernel command line...
         Starting Remount Root and Kernel File Systems...
         Starting Apply Kernel Variables...
         Starting Coldplug All udev Devices...
[  OK  ] Mounted Huge Pages File System.
[  OK  ] Mounted POSIX Message Queue File System.
[  OK  ] Mounted Kernel Debug File System.
[  OK  ] Mounted Kernel Trace File System.
[  OK  ] Finished Create List of Static Device Nodes.
[  OK  ] Finished Monitoring of LVM2 mirror…using dmeventd or progress polling.
[  OK  ] Finished Load Kernel Module configfs.
[  OK  ] Finished Load Kernel Module drm.
[  OK  ] Finished Load Kernel Module efi_pstore.
[  OK  ] Finished Read and set NIS domainname from /etc/sysconfig/network.
[  OK  ] Finished Generate network units from Kernel command line.
         Starting Load Kernel Module efi_pstore...
[  OK  ] Finished Remount Root and Kernel File Systems.
         Activating swap /.swapfile...
         Starting Load/Save OS Random Seed...
         Starting Create Static Device Nodes in /dev...
[  OK  ] Started Journal Service.
[  OK  ] Finished Apply Kernel Variables.
[  OK  ] Finished iscsi-starter.service.
[  OK  ] Activated swap /.swapfile.
[  OK  ] Reached target Swaps.
         Starting Flush Journal to Persistent Storage...
[  OK  ] Finished Load Kernel Module fuse.
[  OK  ] Finished Load Kernel Module efi_pstore.
[  OK  ] Finished Load/Save OS Random Seed.
         Mounting FUSE Control File System...
[  OK  ] Finished Flush Journal to Persistent Storage.
[  OK  ] Mounted FUSE Control File System.
[  OK  ] Finished Create Static Device Nodes in /dev.
         Starting Rule-based Manager for Device Events and Files...
[  OK  ] Finished Coldplug All udev Devices.
         Starting Wait for udev To Complete Device Initialization...
[  OK  ] Started Rule-based Manager for Device Events and Files.
         Starting Load Kernel Module configfs...
[  OK  ] Finished Load Kernel Module configfs.
[  OK  ] Started /usr/sbin/lvm vgchange -aay --autoactivation event ocivolume.
[  OK  ] Finished Wait for udev To Complete Device Initialization.
[  OK  ] Reached target Preparation for Local File Systems.
         Mounting /boot...
         Mounting /var/oled...
         Starting File System Check on /dev/disk/by-uuid/BBF7-A736...
[  OK  ] Mounted /boot.
[  OK  ] Mounted /var/oled.
[  OK  ] Finished File System Check on /dev/disk/by-uuid/BBF7-A736.
         Mounting /boot/efi...
[  OK  ] Mounted /boot/efi.
[  OK  ] Reached target Local File Systems.
         Starting Apply Ksplice updates...
         Starting Automatic Boot Loader Update...
         Starting Create Volatile Files and Directories...
[  OK  ] Finished Automatic Boot Loader Update.
[  OK  ] Finished Create Volatile Files and Directories.
         Starting Security Auditing Service...
         Starting RPC Bind...
[  OK  ] Started RPC Bind.
[  OK  ] Started Security Auditing Service.
         Starting Record System Boot/Shutdown in UTMP...
[  OK  ] Finished Record System Boot/Shutdown in UTMP.
[  OK  ] Reached target System Initialization.
[  OK  ] Started "Monitor the /etc/unified-���ent/conf.d/ directory for changes".
[  OK  ] Started dnf makecache --timer.
[  OK  ] Started Ksplice Agent timer.
[  OK  ] Started Daily rotation of log files.
[  OK  ] Started Updates mlocate database every day.
[  OK  ] Started Daily Cleanup of Temporary Directories.
[  OK  ] Started Run unified-monitoring-agent configuration automatic updater..
[  OK  ] Reached target Path Units.
[  OK  ] Listening on D-Bus System Message Bus Socket.
[  OK  ] Listening on Open-iSCSI iscsid Socket.
[  OK  ] Listening on Open-iSCSI iscsiuio Socket.
[  OK  ] Listening on SSSD Kerberos Cache Manager responder socket.
[  OK  ] Reached target Socket Units.
         Starting Cloud-init: Local Stage (pre-network)...
         Starting D-Bus System Message Bus...
         Starting DTrace USDT probe creation daemon...
[  OK  ] Started DTrace USDT probe creation daemon.
[  OK  ] Reached target DTrace USDT operating normally.
[  OK  ] Started D-Bus System Message Bus.
[  OK  ] Reached target Basic System.
         Starting Check whether IPv6 instance for chrony.conf updates....
         Starting Restore /run/initramfs on shutdown...
         Starting firewalld - dynamic firewall daemon...
[  OK  ] Started libstoragemgmt plug-in server daemon.
         Starting Generate random NFS client ID...
[  OK  ] Reached target User and Group Name Lookups.
         Starting User Login Management...
[  OK  ] Finished Restore /run/initramfs on shutdown.
[  OK  ] Finished Check whether IPv6 instance for chrony.conf updates..
[  OK  ] Finished Generate random NFS client ID.
[  OK  ] Started User Login Management.
[   14.758395] cloud-init[1509]: Cloud-init v. 24.4-7.0.1.el9_7.1 running 'init-local' at Thu, 25 Jun 2026 09:37:28 +0000. Up 14.64 seconds.
[  OK  ] Finished Apply Ksplice updates.
[  OK  ] Finished Cloud-init: Local Stage (pre-network).
[  OK  ] Started firewalld - dynamic firewall daemon.
[  OK  ] Reached target Preparation for Network.
         Starting Network Manager...
         Starting Authorization Manager...
[  OK  ] Started Authorization Manager.
         Starting Hostname Service...
[  OK  ] Started Hostname Service.
[  OK  ] Listening on Load/Save RF Kill Switch Status /dev/rfkill Watch.
         Starting Network Manager Script Dispatcher Service...
[  OK  ] Started Network Manager.
[  OK  ] Reached target Network.
         Starting Network Manager Wait Online...
         Starting GSSAPI Proxy Daemon...
         Starting Dynamic System Tuning Daemon...
[  OK  ] Started Network Manager Script Dispatcher Service.
[  OK  ] Started GSSAPI Proxy Daemon.
[  OK  ] Reached target NFS client services.
[  OK  ] Finished Network Manager Wait Online.
         Starting Cloud-init: Network Stage...
[   17.060581] cloud-init[1988]: Cloud-init v. 24.4-7.0.1.el9_7.1 running 'init' at Thu, 25 Jun 2026 09:37:30 +0000. Up 16.97 seconds.
[   17.128089] cloud-init[1988]: ci-info: ++++++++++++++++++++++++++++++++++++Net device info+++++++++++++++++++++++++++++++++++++
[   17.146555] cloud-init[1988]: ci-info: +--------+------+-------------------------+---------------+--------+-------------------+
[   17.166125] cloud-init[1988]: ci-info: | Device |  Up  |         Address         |      Mask     | Scope  |     Hw-Address    |
[   17.185407] cloud-init[1988]: ci-info: +--------+------+-------------------------+---------------+--------+-------------------+
[   17.207063] cloud-init[1988]: ci-info: | enp0s6 | True |        10.0.0.187       | 255.255.255.0 | global | 02:00:17:00:15:92 |
[   17.226531] cloud-init[1988]: ci-info: | enp0s6 | True | fe80::17ff:fe00:1592/64 |       .       |  link  | 02:00:17:00:15:92 |
[   17.246970] cloud-init[1988]: ci-info: |   lo   | True |        127.0.0.1        |   255.0.0.0   |  host  |         .         |
[   17.267897] cloud-init[1988]: ci-info: |   lo   | True |         ::1/128         |       .       |  host  |         .         |
[   17.288113] cloud-init[1988]: ci-info: +--------+------+-------------------------+---------------+--------+-------------------+
[   17.309390] cloud-init[1988]: ci-info: +++++++++++++++++++++++++++Route IPv4 info++++++++++++++++++++++++++++
[   17.327403] cloud-init[1988]: ci-info: +-------+-------------+----------+---------------+-----------+-------+
[   17.345036] cloud-init[1988]: ci-info: | Route | Destination | Gateway  |    Genmask    | Interface | Flags |
[   17.363991] cloud-init[1988]: ci-info: +-------+-------------+----------+---------------+-----------+-------+
[   17.382565] cloud-init[1988]: ci-info: |   0   |   0.0.0.0   | 10.0.0.1 |    0.0.0.0    |   enp0s6  |   UG  |
[   17.398336] cloud-init[1988]: ci-info: |   1   |   10.0.0.0  | 0.0.0.0  | 255.255.255.0 |   enp0s6  |   U   |
[   17.416492] cloud-init[1988]: ci-info: |   2   | 169.254.0.0 | 0.0.0.0  |  255.255.0.0  |   enp0s6  |   U   |
[   17.436501] cloud-init[1988]: ci-info: +-------+-------------+----------+---------------+-----------+-------+
[   17.452895] cloud-init[1988]: ci-info: +++++++++++++++++++Route IPv6 info+++++++++++++++++++
[   17.468907] cloud-init[1988]: ci-info: +-------+-------------+---------+-----------+-------+
[   17.485067] cloud-init[1988]: ci-info: | Route | Destination | Gateway | Interface | Flags |
[   17.497530] cloud-init[1988]: ci-info: +-------+-------------+---------+-----------+-------+
[   17.514490] cloud-init[1988]: ci-info: |   1   |  fe80::/64  |    ::   |   enp0s6  |   U   |
[   17.528824] cloud-init[1988]: ci-info: |   3   |    local    |    ::   |   enp0s6  |   U   |
[   17.548482] cloud-init[1988]: ci-info: |   4   |  multicast  |    ::   |   enp0s6  |   U   |
[  OK  ] Started Dynamic System Tuning Daemon.
[   17.567925] cloud-init[1988]: ci-info: +-------+-------------+---------+-----------+-------+
[  OK  ] Finished Cloud-init: Network Stage.
[  OK  ] Reached target Cloud-config availability.
[  OK  ] Reached target Network is Online.
         Starting NTP client/server...
         Starting Open-iSCSI...
         Starting Prefetch new Ksplice updates...
         Starting Update kernel loglevel for OCI instances...
         Starting Set MTU of IPv6 VNICs to 9000...
[  OK  ] Started Oracle Cloud Infrastructure Yum Region Setting Service.
         Starting Cloud-init: Config Stage...
[  OK  ] Started Oracle Cloud Infrastructure agent updater.
         Starting Performance Metrics Collector Daemon...
         Starting Notify NFS peers of a restart...
         Starting System Logging Service...
[  OK  ] Reached target sshd-keygen.target.
         Starting OpenSSH server daemon...
[  OK  ] Started unified-monitoring-agent: …or for Oracle Cloud Infrastructure.
[  OK  ] Started Oracle Cloud Infrastructur…gent for management and monitoring.
         Starting unified-monitoring-agent Fluentd configuration downloader....
[  OK  ] Started Open-iSCSI.
[  OK  ] Started NTP client/server.
[  OK  ] Finished Update kernel loglevel for OCI instances.
[  OK  ] Finished Set MTU of IPv6 VNICs to 9000.
[  OK  ] Started Notify NFS peers of a restart.
         Starting Logout off all iSCSI sessions on shutdown...
         Starting Login and scanning of iSCSI devices...
[  OK  ] Finished Logout off all iSCSI sessions on shutdown.
[  OK  ] Reached target Preparation for Remote File Systems.
[  OK  ] Finished Login and scanning of iSCSI devices.
[  OK  ] Reached target Remote File Systems.
         Starting Crash recovery kernel arming...
         Starting Permit User Sessions...
[  OK  ] Started System Logging Service.
[  OK  ] Started OpenSSH server daemon.
[  OK  ] Finished Permit User Sessions.
[  OK  ] Started Deferred execution scheduler.
[  OK  ] Started Command Scheduler.
[  OK  ] Started Getty on tty1.
[  OK  ] Started Serial Getty on ttyAMA0.
[  OK  ] Reached target Login Prompts.
[  OK  ] Created slice User Slice of UID 988.
         Starting User Runtime Directory /run/user/988...
[  OK  ] Finished User Runtime Directory /run/user/988.
         Starting User Manager for UID 988...